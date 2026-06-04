import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DashboardModule from "@/models/DashboardModule";
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
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    // Standard employees shouldn't be creating modules
    if (decoded.role === "employee") {
      return NextResponse.json({ success: false, error: "Forbidden: HR permissions required" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { name, description, icon, color, fields } = body;
    const requestedOrgId = body.orgId;
    const orgId = decoded.role === "platform_admin" ? requestedOrgId : decoded.orgId;

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
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    // Standard employees shouldn't be editing modules
    if (decoded.role === "employee") {
      return NextResponse.json({ success: false, error: "Forbidden: HR permissions required" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { id, name, description, icon, color, fields, status, orgId: requestedOrgId } = body;
    const orgId = decoded.role === "platform_admin" ? requestedOrgId : decoded.orgId;

    if (!id) {
      return NextResponse.json({ success: false, error: "Module ID is required" }, { status: 400 });
    }

    // Ensure standard admin only updates within their org
    const query: any = { _id: id };
    if (decoded.role !== "platform_admin") {
      query.orgId = orgId;
    }

    const updatedModule = await DashboardModule.findOneAndUpdate(
      query,
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
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    // Standard employees shouldn't be deleting modules
    if (decoded.role === "employee") {
      return NextResponse.json({ success: false, error: "Forbidden: HR permissions required" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Module ID is required" }, { status: 400 });
    }

    // Ensure standard admin only deletes within their org
    const query: any = { _id: id };
    if (decoded.role !== "platform_admin") {
      query.orgId = decoded.orgId;
    }

    const deleted = await DashboardModule.findOneAndDelete(query);
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
