import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Employee from "@/models/Employee";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId query parameter is required" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, data: { _id: id, empName: "Offline Mock", status: "active", orgId } });
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
    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    const orgId = body.orgId;

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId is required in body" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, data: { _id: id, ...body } });
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
    const params = await context.params;
    const { id } = params;
    const body = await req.json().catch(() => ({})); // Handle if body is empty
    const orgId = body.orgId;

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId is required in body" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, message: "Employee deleted (offline)" });
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
