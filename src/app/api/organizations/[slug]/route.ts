import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    await dbConnect();
    
    const params = await context.params;
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Organization identifier is required" },
        { status: 400 }
      );
    }

    // Support lookup by ObjectId or by slug
    let org;
    if (mongoose.Types.ObjectId.isValid(slug)) {
      org = await Organization.findById(slug);
    }
    if (!org) {
      org = await Organization.findOne({ slug });
    }

    if (!org) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: org });
  } catch (error: any) {
    console.error("Fetch Organization Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch organization" },
      { status: 500 }
    );
  }
}
