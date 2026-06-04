import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Employee from "@/models/Employee";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId query parameter is required" }, { status: 400 });
    }

    await dbConnect();
    const employees = await Employee.find({ orgId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: employees });
  } catch (error: any) {
    console.error("Database connection error in GET /api/employees:", error);
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
    const { orgId, empName, empAge, empPosition, email, password, department, salary } = body;

    if (!orgId || !empName || !empAge || !empPosition || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields (including email and password)" }, { status: 400 });
    }

    const newEmployee = await Employee.create({
      orgId,
      empName,
      empAge: Number(empAge),
      empPosition,
      email,
      password, // Save the password
      department: department || "Engineering",
      status: "active",
      salary: salary ? Number(salary) : 95000,
      clockedIn: false,
      leaveBalances: { casual: 12, sick: 10, earned: 15 },
    });

    return NextResponse.json({ success: true, data: newEmployee }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/employees Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create employee" },
      { status: 500 }
    );
  }
}
