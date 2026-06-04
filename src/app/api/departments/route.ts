import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Department from "@/models/Department";
import { getDepartmentBySlug } from "@/lib/departmentRegistry";
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
    const departments = await Department.find({ orgId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: departments });
  } catch (error: any) {
    console.error("Database connection error in GET /api/departments:", error);
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

    // Standard employees shouldn't be creating departments
    if (decoded.role === "employee") {
      return NextResponse.json({ success: false, error: "Forbidden: HR permissions required" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    let { slug, name, description, budget, headIds, managers } = body;
    const requestedOrgId = body.orgId;
    const orgId = decoded.role === "platform_admin" ? requestedOrgId : decoded.orgId;
    
    if (!orgId || !name) {
      return NextResponse.json({ success: false, error: "orgId and name are required" }, { status: 400 });
    }

    let isPredefined = false;

    // Auto-provision if slug is provided
    if (slug) {
      const predefined = getDepartmentBySlug(slug);
      if (predefined) {
        name = predefined.name;
        description = predefined.description;
        isPredefined = true;
      }
    }

    const department = await Department.create({
      orgId,
      slug,
      name,
      description: description || "",
      isPredefined,
      headIds: headIds || [],
      budget: budget || { annual: 50000, currency: "USD" },
      status: "active",
      managers: managers || [],
    });

    return NextResponse.json({ success: true, data: department }, { status: 201 });
  } catch (error: any) {
    console.error("Database error in POST /api/departments:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create department" },
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

    // Standard employees shouldn't be editing departments
    if (decoded.role === "employee") {
      return NextResponse.json({ success: false, error: "Forbidden: HR permissions required" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { id, headIds, managers, budget, orgId: requestedOrgId } = body;
    const orgId = decoded.role === "platform_admin" ? requestedOrgId : decoded.orgId;

    if (!id) {
      return NextResponse.json({ success: false, error: "Department ID is required" }, { status: 400 });
    }

    // Ensure they only update within their org unless platform admin
    const query: any = { _id: id };
    if (decoded.role !== "platform_admin") {
      query.orgId = orgId;
    }

    const updatedDept = await Department.findOneAndUpdate(
      query,
      {
        ...(headIds !== undefined && { headIds }),
        ...(managers !== undefined && { managers }),
        ...(budget !== undefined && { budget }),
      },
      { new: true }
    );

    if (!updatedDept) {
      return NextResponse.json({ success: false, error: "Department not found in database" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedDept });
  } catch (error: any) {
    console.error("Database error in PUT /api/departments:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update department" },
      { status: 500 }
    );
  }
}
