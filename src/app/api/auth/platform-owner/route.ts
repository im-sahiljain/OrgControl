import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PlatformOwner from "@/models/PlatformOwner";

export async function GET() {
  try {
    await dbConnect();
    const owner = await PlatformOwner.findOne({}).select("-password");
    
    if (!owner) {
      return NextResponse.json({ success: false, error: "No platform owner found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: owner._id.toString(),
        name: owner.name,
        email: owner.email,
        role: owner.role,
      },
    });
  } catch (error: any) {
    console.error("Platform Owner Fetch Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch platform owner" },
      { status: 500 }
    );
  }
}
