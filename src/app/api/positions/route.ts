import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import JobPosition from "@/models/JobPosition";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId query parameter is required" }, { status: 400 });
    }

    await dbConnect();
    const positions = await JobPosition.find({ orgId, status: "active" }).sort({ title: 1 });

    return NextResponse.json({ success: true, data: positions });
  } catch (error: any) {
    console.error("Database connection error in GET /api/positions:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { orgId, title, description, department } = body;

    if (!orgId || !title) {
      return NextResponse.json({ success: false, error: "Missing required fields including orgId" }, { status: 400 });
    }
    
    // Check if position title already exists
    const existing = await JobPosition.findOne({ orgId, title });
    if (existing) {
      return NextResponse.json({ success: false, error: "Position title already exists." }, { status: 400 });
    }

    const newPos = await JobPosition.create({
      orgId,
      title,
      description: description || "",
      department: department || "Unassigned",
      status: "active",
    });

    return NextResponse.json({ success: true, data: newPos }, { status: 201 });
  } catch (error: any) {
    console.error("Database error in POST /api/positions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create position" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Position ID is required" }, { status: 400 });
    }

    const deleted = await JobPosition.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Position not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Position deleted successfully" });
  } catch (error: any) {
    console.error("Database error in DELETE /api/positions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete position" },
      { status: 500 }
    );
  }
}
