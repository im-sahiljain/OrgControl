import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Employee from "@/models/Employee";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const requestedOrgId = searchParams.get("orgId");
    const orgId = decoded.role === "platform_admin" ? requestedOrgId : decoded.orgId;

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId query parameter is required" }, { status: 400 });
    }

    await dbConnect();
    const employee = await Employee.findOne({ _id: id, orgId });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    // Standard employees shouldn't be updating other employees
    if (decoded.role === "employee" && decoded.id !== (await context.params).id) {
      return NextResponse.json({ success: false, error: "Forbidden: HR permissions required" }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    const requestedOrgId = body.orgId;
    const orgId = decoded.role === "platform_admin" ? requestedOrgId : decoded.orgId;

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId is required" }, { status: 400 });
    }

    await dbConnect();
    const employee = await Employee.findOneAndUpdate(
      { _id: id, orgId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    // Standard employees shouldn't be deleting employees
    if (decoded.role === "employee") {
      return NextResponse.json({ success: false, error: "Forbidden: HR permissions required" }, { status: 403 });
    }

    const params = await context.params;
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const requestedOrgId = body.orgId;
    const orgId = decoded.role === "platform_admin" ? requestedOrgId : decoded.orgId;

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId is required" }, { status: 400 });
    }

    await dbConnect();
    const employee = await Employee.findOneAndDelete({ _id: id, orgId });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
