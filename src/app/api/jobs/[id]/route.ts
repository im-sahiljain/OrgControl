import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import JobPosting from "@/models/JobPosting";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    const job = await JobPosting.findById(id);
    if (!job) {
      return NextResponse.json({ success: false, error: "Job posting not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    console.error("GET /api/jobs/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    if (decoded.isSandbox) {
      return NextResponse.json({ success: false, error: "Operation not performable in Mock" }, { status: 403 });
    }

    await dbConnect();
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const { title, department, location, type, description, requirements, status } = body;

    const job = await JobPosting.findById(id);
    if (!job) {
      return NextResponse.json({ success: false, error: "Job posting not found" }, { status: 404 });
    }

    // Update fields if provided
    if (title !== undefined) job.title = title;
    if (department !== undefined) job.department = department;
    if (location !== undefined) job.location = location;
    if (type !== undefined) job.type = type;
    if (description !== undefined) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (status !== undefined) job.status = status;

    await job.save();

    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    console.error("PUT /api/jobs/[id] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
