import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Employee from "@/models/Employee";
import Organization from "@/models/Organization";

export async function GET() {
  try {
    await dbConnect();
    
    // Find the default organization Org Technologies
    const org = await Organization.findOne({ slug: "org-technologies" });
    if (!org) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch only HR employees (no passwords or sensitive data like salaries)
    const hrEmployees = await Employee.find(
      { orgId: org._id.toString(), department: "Human Resources" },
      { empName: 1, email: 1, department: 1, empPosition: 1, orgId: 1 }
    ).lean();

    return NextResponse.json({ success: true, data: hrEmployees });
  } catch (error: any) {
    console.error("Error fetching sandbox profiles:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
