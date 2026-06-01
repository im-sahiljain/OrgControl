import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Employee from "@/models/Employee";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const id = params.id;

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: false, error: "Database offline" }, { status: 503 });
    }

    await dbConnect();
    const employee = await Employee.findOne({ _id: id, orgId: "org_default" });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await req.json();

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, data: { _id: id, ...body } });
    }

    await dbConnect();
    const employee = await Employee.findOneAndUpdate(
      { _id: id, orgId: "org_default" },
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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const id = params.id;

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, data: { _id: id } });
    }

    await dbConnect();
    const employee = await Employee.findOneAndDelete({ _id: id, orgId: "org_default" });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
