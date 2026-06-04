import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    await dbConnect();
    
    const params = await context.params;
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Organization slug is required" },
        { status: 400 }
      );
    }

    let org = await Organization.findOne({ slug });

    if (!org && slug === "org_default") {
      org = await Organization.create({
        name: "Acme Corporation (Demo)",
        slug: "org_default",
        plan: "Enterprise",
        adminEmail: "admin@company.in",
        status: "active"
      });
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
