import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ModuleEntry from "@/models/ModuleEntry";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const moduleId = searchParams.get("moduleId");

    if (!orgId || !moduleId) {
      return NextResponse.json({ success: false, error: "orgId and moduleId are required" }, { status: 400 });
    }

    await dbConnect();
    const entries = await ModuleEntry.find({ orgId, moduleId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: entries });
  } catch (error: any) {
    console.error("Database connection error in GET /api/module-entries:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgId, moduleId, departmentId, submittedBy, data } = body;

    if (!orgId || !moduleId || !departmentId || !submittedBy || !data) {
      return NextResponse.json({ success: false, error: "Missing required fields including orgId" }, { status: 400 });
    }

    await dbConnect();
    const newEntry = await ModuleEntry.create({
      orgId,
      moduleId,
      departmentId,
      submittedBy,
      data,
      status: "pending",
    });

    return NextResponse.json({ success: true, data: newEntry });
  } catch (error: any) {
    console.error("Database error in POST /api/module-entries:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit entry" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { orgId, moduleId } = body;

    if (!orgId || !moduleId) {
      return NextResponse.json({ success: false, error: "orgId and moduleId are required" }, { status: 400 });
    }

    await dbConnect();
    await ModuleEntry.updateMany(
      { orgId, moduleId, status: "pending" },
      { $set: { status: "approved" } }
    );

    return NextResponse.json({ success: true, message: "All pending entries approved successfully" });
  } catch (error: any) {
    console.error("Database error in PUT /api/module-entries:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update entries" },
      { status: 500 }
    );
  }
}
