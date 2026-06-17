import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Candidate from "@/models/Candidate";
import { generateEmbedding, getDeterministicMockEmbedding } from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const jobId = searchParams.get("jobId");
    const id = searchParams.get("id");

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "orgId query parameter is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // 1. Single Candidate Lookup (Detailed view)
    if (id) {
      const candidate = await Candidate.findById(id);
      if (!candidate) {
        return NextResponse.json(
          { success: false, error: "Candidate not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true, data: candidate });
    }

    // 2. Bulk List Query (Optimized table views)
    const query: any = { orgId };
    if (jobId) {
      query.jobId = jobId;
    }

    const stage = searchParams.get("stage");
    if (stage && stage !== "all") {
      query.stage = stage;
    }

    const isAiScreened = searchParams.get("isAiScreened");
    if (isAiScreened === "true" || isAiScreened === "false") {
      query.isAiScreened = isAiScreened === "true";
    }

    const search = searchParams.get("search")?.trim();
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const candidates = await Candidate.find(query)
      .select(
        "name email phone skills matchScore stage isAiScreened jobId orgId createdAt resumeUrl summary pros cons interviewQuestions",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Candidate.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: candidates,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/candidates Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    let decoded = await verifyToken(req);
    let forceMock = false;
    if (!decoded || decoded.isSandbox) {
      forceMock = true;
      if (!decoded) {
        const isDevOrMock = 
          process.env.NODE_ENV === "development" ||
          !process.env.GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY.includes("your_gemini_key");
          
        if (isDevOrMock) {
          decoded = {
            role: "platform_admin",
            orgId: "6a2161415b2d4dbff95e7c0c",
            email: "mock-admin@orgcontrol.com",
          };
        } else {
          return NextResponse.json(
            { success: false, error: "Unauthorized: Invalid or missing token" },
            { status: 401 },
          );
        }
      }
    }

    await dbConnect();
    const body = await req.json();
    const {
      orgId,
      jobId,
      name,
      email,
      phone,
      resumeUrl,
      stage,
      isAiScreened,
      matchScore,
      skills,
      summary,
      pros,
      cons,
      interviewQuestions,
      resumeText,
    } = body;

    if (!orgId || !jobId || !name || !email || !phone || !resumeUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    console.log("stage", stage);

    let resumeEmbedding: number[] = [];
    if (resumeText) {
      try {
        if (forceMock) {
          console.log("[Candidates POST] Bypassing live Gemini API because user is mock/unauthenticated. Using deterministic mock embedding.");
          resumeEmbedding = getDeterministicMockEmbedding(resumeText);
        } else {
          resumeEmbedding = await generateEmbedding(resumeText);
        }
      } catch (embErr) {
        console.warn("Failed to generate embedding on POST:", embErr);
      }
    }

    const newCandidate = await Candidate.create({
      orgId,
      jobId,
      name,
      email,
      phone,
      resumeUrl,
      stage: "screened",
      isAiScreened: isAiScreened !== undefined ? isAiScreened : false,
      matchScore: matchScore || 0,
      skills: skills || [],
      summary: summary || "",
      pros: pros || [],
      cons: cons || [],
      interviewQuestions: interviewQuestions || [],
      resumeText: resumeText || "",
      resumeEmbedding: resumeEmbedding,
    });

    return NextResponse.json(
      { success: true, data: newCandidate },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("POST /api/candidates Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    let decoded = await verifyToken(req);
    let forceMock = false;
    if (!decoded || decoded.isSandbox) {
      forceMock = true;
      if (!decoded) {
        const isDevOrMock = 
          process.env.NODE_ENV === "development" ||
          !process.env.GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY.includes("your_gemini_key");
          
        if (isDevOrMock) {
          decoded = {
            role: "platform_admin",
            orgId: "6a2161415b2d4dbff95e7c0c",
            email: "mock-admin@orgcontrol.com",
          };
        } else {
          return NextResponse.json(
            { success: false, error: "Unauthorized: Invalid or missing token" },
            { status: 401 },
          );
        }
      }
    }

    await dbConnect();
    const body = await req.json();
    const {
      id,
      stage,
      name,
      email,
      phone,
      isAiScreened,
      matchScore,
      skills,
      summary,
      pros,
      cons,
      interviewQuestions,
      resumeText,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Candidate ID is required" },
        { status: 400 },
      );
    }

    const updateData: any = {};
    if (stage !== undefined) updateData.stage = stage;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isAiScreened !== undefined) updateData.isAiScreened = isAiScreened;
    if (matchScore !== undefined) updateData.matchScore = matchScore;
    if (skills !== undefined) updateData.skills = skills;
    if (summary !== undefined) updateData.summary = summary;
    if (pros !== undefined) updateData.pros = pros;
    if (cons !== undefined) updateData.cons = cons;
    if (interviewQuestions !== undefined)
      updateData.interviewQuestions = interviewQuestions;

    if (resumeText !== undefined) {
      updateData.resumeText = resumeText;
      if (resumeText) {
        try {
          if (forceMock) {
            console.log("[Candidates PUT] Bypassing live Gemini API because user is mock/unauthenticated. Using deterministic mock embedding.");
            updateData.resumeEmbedding = getDeterministicMockEmbedding(resumeText);
          } else {
            updateData.resumeEmbedding = await generateEmbedding(resumeText);
          }
        } catch (embErr) {
          console.warn("Failed to generate embedding on PUT:", embErr);
        }
      } else {
        updateData.resumeEmbedding = [];
      }
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedCandidate) {
      return NextResponse.json(
        { success: false, error: "Candidate not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedCandidate });
  } catch (error: any) {
    console.error("PUT /api/candidates Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
