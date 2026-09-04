import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Candidate from "@/models/Candidate";
import Employee from "@/models/Employee";

// GET /api/recruitment/onboard?orgId=... - returns next suggested sequential ID
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const year = new Date().getFullYear();

    const count = orgId ? await Employee.countDocuments({ orgId }) : await Employee.countDocuments();
    const empNumber = String(count + 1).padStart(4, "0");
    const suggestedId = `EMP-${year}-${empNumber}`;

    return NextResponse.json({ success: true, suggestedId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/recruitment/onboard - Converts an accepted offer candidate into a full Employee
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { candidateId, department, workEmail, employeeId: customId, password } = await req.json();

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required" },
        { status: 400 }
      );
    }

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    if (candidate.offerStatus !== "accepted") {
      return NextResponse.json(
        { error: "Only candidates with an 'accepted' offer status can be onboarded" },
        { status: 400 }
      );
    }

    if (candidate.stage === "hired" && candidate.onboardedEmployeeId) {
      return NextResponse.json(
        {
          error: "Candidate has already been onboarded",
          employeeId: candidate.onboardedEmployeeId,
        },
        { status: 400 }
      );
    }

    // Auto-generate or use custom Employee ID
    const year = new Date().getFullYear();
    let finalEmployeeId = customId;
    if (!finalEmployeeId) {
      const totalEmployees = await Employee.countDocuments({ orgId: candidate.orgId });
      const empNumber = String(totalEmployees + 1).padStart(4, "0");
      finalEmployeeId = `EMP-${year}-${empNumber}`;
    }

    // Parse numeric salary or default
    const parsedSalary = parseFloat(
      (candidate.offerDetails?.salary || "80000").replace(/[^0-9.]/g, "")
    ) || 80000;

    // Create Employee Record matching IEmployee interface
    const newEmployee = await Employee.create({
      orgId: candidate.orgId,
      empName: candidate.name,
      empAge: 25,
      empPosition: candidate.offerDetails?.designation || "Team Member",
      email: workEmail !== undefined ? workEmail : candidate.email,
      department: department || "Engineering",
      status: "active",
      salary: parsedSalary,
      clockedIn: false,
      leaveBalances: {
        casual: 12,
        sick: 10,
        earned: 15,
      },
    });

    // Update candidate record
    candidate.stage = "hired";
    candidate.onboardedEmployeeId = finalEmployeeId;
    await candidate.save();

    return NextResponse.json({
      success: true,
      message: "Candidate onboarded successfully as Employee",
      data: {
        employeeId: finalEmployeeId,
        candidateName: candidate.name,
        empPosition: newEmployee.empPosition,
        employeeObj: newEmployee,
        initialPassword: password || "Welcome@123",
      },
    });
  } catch (error: any) {
    console.error("Error onboarding candidate:", error);
    return NextResponse.json(
      { error: "Failed to onboard candidate as employee" },
      { status: 500 }
    );
  }
}
