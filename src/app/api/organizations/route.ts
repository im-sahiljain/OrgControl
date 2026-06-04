import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";

export async function GET() {
  try {
    await dbConnect();
    const organizations = await Organization.find({});
    return NextResponse.json({ success: true, data: organizations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
