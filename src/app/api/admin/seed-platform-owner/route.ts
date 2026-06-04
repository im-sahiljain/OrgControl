import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import PlatformOwner from "@/models/PlatformOwner";

export async function GET() {
  try {
    await dbConnect();
    
    const existing = await PlatformOwner.findOne({ email: "admin@saasmaker.in" });
    if (existing) {
      return NextResponse.json({ success: true, message: "Already seeded." });
    }

    await PlatformOwner.create({
      name: "Platform Owner",
      email: "admin@saasmaker.in",
      password: "admin123",
      role: "platform_admin",
    });

    return NextResponse.json({ success: true, message: "Successfully seeded Platform Owner." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
