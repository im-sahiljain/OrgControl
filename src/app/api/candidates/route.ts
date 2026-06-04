import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Candidate from "@/models/Candidate";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const jobId = searchParams.get("jobId");

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId query parameter is required" }, { status: 400 });
    }

    await dbConnect();
    const query: any = { orgId };
    if (jobId) {
      query.jobId = jobId;
    }

    const candidates = await Candidate.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: candidates });
  } catch (error: any) {
    console.error("GET /api/candidates Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
    } = body;

    if (!orgId || !jobId || !name || !email || !phone || !resumeUrl) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newCandidate = await Candidate.create({
      orgId,
      jobId,
      name,
      email,
      phone,
      resumeUrl,
      stage: stage || "applied",
      isAiScreened: isAiScreened !== undefined ? isAiScreened : false,
      matchScore: matchScore || 0,
      skills: skills || [],
      summary: summary || "",
      pros: pros || [],
      cons: cons || [],
      interviewQuestions: interviewQuestions || [],
    });

    return NextResponse.json({ success: true, data: newCandidate }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/candidates Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, stage, name, email, phone, isAiScreened, matchScore, skills, summary, pros, cons, interviewQuestions } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Candidate ID is required" }, { status: 400 });
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
    if (interviewQuestions !== undefined) updateData.interviewQuestions = interviewQuestions;

    const updatedCandidate = await Candidate.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedCandidate) {
      return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCandidate });
  } catch (error: any) {
    console.error("PUT /api/candidates Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
