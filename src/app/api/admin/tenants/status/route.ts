import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { orgId, status } = await req.json();

    if (!orgId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!["active", "suspended"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const updatedOrg = await Organization.findByIdAndUpdate(
      orgId,
      { status },
      { new: true }
    );

    if (!updatedOrg) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedOrg });
  } catch (error: any) {
    console.error("Update Tenant Status Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
