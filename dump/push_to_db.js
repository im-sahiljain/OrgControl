const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env");
  process.exit(1);
}

// Fixed Org ID for testing/demo
const TARGET_ORG_ID = new mongoose.Types.ObjectId("6a2161415b2d4dbff95e7c0c");

async function seedDatabase() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB database.");

  const jobsSeed = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_jobs_seed.json'), 'utf8'));
  const candidatesSeed = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_candidates_seed.json'), 'utf8'));

  // 1. Insert Job Postings
  const jobIdMap = {};
  for (const job of jobsSeed) {
    const createdJob = await mongoose.connection.db.collection('jobpostings').insertOne({
      orgId: TARGET_ORG_ID,
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type || "Full-time",
      description: job.description,
      requirements: job.requirements || [],
      status: job.status || "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    jobIdMap[job.id] = createdJob.insertedId;
    console.log(`Created Job Posting: "${job.title}" -> ID: ${createdJob.insertedId}`);
  }

  // 2. Insert Candidates with real PDF resume URLs & linked job IDs
  for (const cand of candidatesSeed) {
    const mongoJobId = jobIdMap[cand.jobRefId];
    if (!mongoJobId) {
      console.warn(`Job reference ${cand.jobRefId} not found for candidate ${cand.name}`);
      continue;
    }

    const insertedCandidate = await mongoose.connection.db.collection('candidates').insertOne({
      orgId: TARGET_ORG_ID,
      jobId: mongoJobId,
      name: cand.name,
      email: cand.email,
      phone: cand.phone,
      resumeUrl: cand.resumeUrl,
      stage: cand.stage || "applied",
      offerStatus: cand.offerStatus || "none",
      offerDetails: cand.offerDetails || undefined,
      isAiScreened: cand.isAiScreened !== undefined ? cand.isAiScreened : true,
      matchScore: cand.matchScore || 85,
      skills: cand.skills || [],
      summary: cand.summary || "",
      pros: cand.pros || [],
      cons: cand.cons || [],
      interviewQuestions: cand.interviewQuestions || [],
      resumeText: cand.resumeText || "",
      resumeEmbedding: [], // Will be generated or queried dynamically
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`Inserted Candidate: "${cand.name}" for Job ID: ${mongoJobId} -> Candidate ID: ${insertedCandidate.insertedId}`);
  }

  console.log("\nDatabase seeding completed successfully!");
  await mongoose.disconnect();
}

seedDatabase().catch(console.error);
