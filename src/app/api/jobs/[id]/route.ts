import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import JobPosting from "@/models/JobPosting";

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
