import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import JobPosting from "@/models/JobPosting";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    await dbConnect();
    const query: any = { status: "active" };
    if (orgId) {
      query.orgId = orgId;
    }
    
    const jobs = await JobPosting.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    console.error("GET /api/jobs Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { orgId, title, department, location, type, description, requirements } = body;

    if (!orgId || !title || !department || !location || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newJob = await JobPosting.create({
      orgId,
      title,
      department,
      location,
      type: type || "Full-time",
      description,
      requirements: requirements || [],
      status: "active",
    });

    return NextResponse.json({ success: true, data: newJob }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/jobs Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
