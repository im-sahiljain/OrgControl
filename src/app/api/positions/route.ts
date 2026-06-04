import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import JobPosition from "@/models/JobPosition";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedOrgId = searchParams.get("orgId");
    const orgId = decoded.role === "platform_admin" ? requestedOrgId : decoded.orgId;

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
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    // Standard employees shouldn't be creating positions
    if (decoded.role === "employee") {
      return NextResponse.json({ success: false, error: "Forbidden: HR permissions required" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { title, description, department } = body;
    const requestedOrgId = body.orgId;
    const orgId = decoded.role === "platform_admin" ? requestedOrgId : decoded.orgId;

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
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    // Standard employees shouldn't be deleting positions
    if (decoded.role === "employee") {
      return NextResponse.json({ success: false, error: "Forbidden: HR permissions required" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Position ID is required" }, { status: 400 });
    }

    // Ensure standard admin only deletes within their org
    const query: any = { _id: id };
    if (decoded.role !== "platform_admin") {
      query.orgId = decoded.orgId;
    }

    const deleted = await JobPosition.findOneAndDelete(query);
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
