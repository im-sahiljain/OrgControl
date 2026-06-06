import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Candidate from "@/models/Candidate";
import JobPosting from "@/models/JobPosting";
import { generateEmbedding } from "@/lib/gemini";

// Helper functions for Cosine Similarity calculation
function dotProduct(vecA: number[], vecB: number[]): number {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vec: number[]): number {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  const dotProd = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  if (magA === 0 || magB === 0) return 0;
  return dotProd / (magA * magB);
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { jobId, searchQuery, limit = 15 } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "jobId is required for matching candidates" },
        { status: 400 }
      );
    }

    // 1. Determine query text & generate vector embedding
    let queryText = "";
    if (searchQuery && searchQuery.trim().length > 0) {
      queryText = searchQuery.trim();
      console.log(`Performing semantic RAG search with query: "${queryText}"`);
    } else {
      // If no search query is specified, match candidates against the job posting description
      const job = await JobPosting.findById(jobId);
      if (!job) {
        return NextResponse.json(
          { success: false, error: "Job posting not found" },
          { status: 404 }
        );
      }
      queryText = `Job Title: ${job.title}\nJob Description: ${job.description}\nRequirements: ${(job.requirements || []).join(", ")}`;
      console.log(`Performing RAG matching against Job Description for: "${job.title}"`);
    }

    // Generate query embedding (768-dimensions)
    const queryVector = await generateEmbedding(queryText);

    let candidates: any[] = [];
    let searchMethod = "vectorSearch";

    // 2. Perform search
    try {
      console.log(`[RAG Match] Running Atlas Vector Search for jobId: "${jobId}"`);
      // Attempt Atlas Vector Search
      candidates = await Candidate.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "resumeEmbedding",
            queryVector: queryVector,
            numCandidates: 100,
            limit: limit,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            phone: 1,
            resumeUrl: 1,
            stage: 1,
            isAiScreened: 1,
            matchScore: 1,
            skills: 1,
            summary: 1,
            createdAt: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ]);
      console.log(`[RAG Match] Atlas Vector Search returned ${candidates.length} candidate(s).`);

      // Fallback if the Atlas index hasn't been created yet and returns 0 results
      if (candidates.length === 0) {
        const countWithEmbeddings = await Candidate.countDocuments({
          jobId,
          resumeEmbedding: { $exists: true, $ne: [] },
        });
        if (countWithEmbeddings > 0) {
          console.log(`[RAG Match] Atlas returned 0 results but ${countWithEmbeddings} candidates have embeddings. Forcing in-memory fallback.`);
          throw new Error("Atlas vector index is inactive or not configured.");
        }
      }

      // Map scores to a readable percentage match
      candidates = candidates.map((cand) => ({
        ...cand,
        matchPercentage: Math.round((cand.score || 0) * 100),
      }));
    } catch (vectorSearchError: any) {
      console.warn(
        "MongoDB Atlas Vector Search index failed/unsupported. Falling back to in-memory cosine similarity.",
        vectorSearchError.message
      );
      searchMethod = "inMemoryFallback";

      // 3. Fallback: Load all candidate vectors for the jobId and calculate cosine similarity
      console.log(`[RAG Match] Querying database candidates for jobId: "${jobId}"`);
      const allCandidates = await Candidate.find({
        jobId,
        resumeEmbedding: { $exists: true, $ne: [] },
      }).select(
        "name email phone resumeUrl stage isAiScreened matchScore skills summary createdAt resumeEmbedding"
      );
      console.log(`[RAG Match] Loaded ${allCandidates.length} candidates with valid embeddings.`);

      const scoredCandidates = allCandidates.map((cand: any) => {
        const similarity = cosineSimilarity(queryVector, cand.resumeEmbedding);
        // Normalize similarity: cosine similarity outputs [-1, 1], so we normalize or scale it to [0, 1]
        // Cosine similarity for embeddings is normally positive, so mapping [0, 1] works well.
        const score = Math.max(0, similarity);
        const matchPercentage = Math.round(score * 100);

        return {
          _id: cand._id,
          name: cand.name,
          email: cand.email,
          phone: cand.phone,
          resumeUrl: cand.resumeUrl,
          stage: cand.stage,
          isAiScreened: cand.isAiScreened,
          matchScore: cand.matchScore,
          skills: cand.skills,
          summary: cand.summary,
          createdAt: cand.createdAt,
          score: score,
          matchPercentage: matchPercentage,
        };
      });

      // Sort descending by score
      scoredCandidates.sort((a, b) => b.score - a.score);
      candidates = scoredCandidates.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: candidates,
      searchMethod,
    });
  } catch (error: any) {
    console.error("POST /api/candidates/match Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
