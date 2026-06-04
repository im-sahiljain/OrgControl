import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DashboardModule from "@/models/DashboardModule";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId query parameter is required" }, { status: 400 });
    }

    await dbConnect();
    const modules = await DashboardModule.find({ orgId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: modules });
  } catch (error: any) {
    console.error("Database connection error in GET /api/modules:", error);
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
    const { orgId, name, description, icon, color, fields } = body;

    if (!orgId || !name || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ success: false, error: "Missing required fields including orgId" }, { status: 400 });
    }

    const newModule = await DashboardModule.create({
      orgId,
      name,
      description: description || "",
      icon: icon || "Layout",
      color: color || "blue",
      fields,
      status: "active",
    });

    return NextResponse.json({ success: true, data: newModule }, { status: 201 });
  } catch (error: any) {
    console.error("Database error in POST /api/modules:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create module" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, name, description, icon, color, fields, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Module ID is required" }, { status: 400 });
    }

    const updatedModule = await DashboardModule.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(fields && { fields }),
        ...(status && { status }),
      },
      { new: true }
    );

    if (!updatedModule) {
      return NextResponse.json({ success: false, error: "Module not found in database" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedModule });
  } catch (error: any) {
    console.error("Database error in PUT /api/modules:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update module" },
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
      return NextResponse.json({ success: false, error: "Module ID is required" }, { status: 400 });
    }

    const deleted = await DashboardModule.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Module not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Module deleted successfully" });
  } catch (error: any) {
    console.error("Database error in DELETE /api/modules:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete module" },
      { status: 500 }
    );
  }
}
