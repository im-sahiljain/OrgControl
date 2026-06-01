import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Employee from "@/models/Employee";

// Complete corporate directory of 12 employees spanning 4 departments and 3 hierarchical tiers
let localMockEmployees = [
  // Engineering Team
  {
    _id: "mock_eng_head",
    orgId: "org_default",
    empName: "Rohan Gupta",
    empAge: 41,
    empPosition: "VP of Engineering (Head)",
    email: "rohan.gupta@company.in",
    profilePhoto: "",
    department: "Engineering",
    status: "active",
    salary: 250000,
    clockedIn: true,
    leaveBalances: { casual: 10, sick: 10, earned: 15 },
  },
  {
    _id: "mock_eng_mgr",
    orgId: "org_default",
    empName: "Ananya Patel",
    empAge: 34,
    empPosition: "Engineering Manager",
    email: "ananya.patel@company.in",
    profilePhoto: "",
    department: "Engineering",
    status: "active",
    salary: 180000,
    clockedIn: true,
    leaveBalances: { casual: 12, sick: 8, earned: 14 },
  },
  {
    _id: "mock_eng_dev",
    orgId: "org_default",
    empName: "Aarav Sharma",
    empAge: 32,
    empPosition: "Senior Software Engineer",
    email: "aarav.sharma@company.in",
    profilePhoto: "",
    department: "Engineering",
    status: "active",
    salary: 150000,
    clockedIn: true,
    leaveBalances: { casual: 8, sick: 7, earned: 12 },
  },

  // Sales Team
  {
    _id: "mock_sales_head",
    orgId: "org_default",
    empName: "Vikram Malhotra",
    empAge: 43,
    empPosition: "VP of Sales (Head)",
    email: "vikram.malhotra@company.in",
    profilePhoto: "",
    department: "Sales",
    status: "active",
    salary: 220000,
    clockedIn: true,
    leaveBalances: { casual: 9, sick: 11, earned: 15 },
  },
  {
    _id: "mock_sales_mgr",
    orgId: "org_default",
    empName: "Priya Nair",
    empAge: 35,
    empPosition: "Sales Manager",
    email: "priya.nair@company.in",
    profilePhoto: "",
    department: "Sales",
    status: "active",
    salary: 160000,
    clockedIn: false,
    leaveBalances: { casual: 11, sick: 9, earned: 13 },
  },
  {
    _id: "mock_sales_rep",
    orgId: "org_default",
    empName: "Amit Patel",
    empAge: 26,
    empPosition: "Sales Executive",
    email: "amit.patel@company.in",
    profilePhoto: "",
    department: "Sales",
    status: "active",
    salary: 90000,
    clockedIn: true,
    leaveBalances: { casual: 14, sick: 10, earned: 12 },
  },

  // Finance Team
  {
    _id: "mock_fin_head",
    orgId: "org_default",
    empName: "Neha Reddy",
    empAge: 45,
    empPosition: "CFO (Head)",
    email: "neha.reddy@company.in",
    profilePhoto: "",
    department: "Finance",
    status: "active",
    salary: 280000,
    clockedIn: true,
    leaveBalances: { casual: 8, sick: 12, earned: 18 },
  },
  {
    _id: "mock_fin_mgr",
    orgId: "org_default",
    empName: "Kabir Sen",
    empAge: 38,
    empPosition: "Finance Manager",
    email: "kabir.sen@company.in",
    profilePhoto: "",
    department: "Finance",
    status: "active",
    salary: 190000,
    clockedIn: true,
    leaveBalances: { casual: 10, sick: 10, earned: 15 },
  },
  {
    _id: "mock_fin_analyst",
    orgId: "org_default",
    empName: "Diya Mehta",
    empAge: 27,
    empPosition: "Financial Analyst",
    email: "diya.mehta@company.in",
    profilePhoto: "",
    department: "Finance",
    status: "active",
    salary: 110000,
    clockedIn: false,
    leaveBalances: { casual: 12, sick: 8, earned: 14 },
  },

  // Human Resources Team
  {
    _id: "mock_hr_head",
    orgId: "org_default",
    empName: "Sahil",
    empAge: 36,
    empPosition: "CHRO (Head of HR)",
    email: "admin@company.in",
    profilePhoto: "",
    department: "Human Resources",
    status: "active",
    salary: 200000,
    clockedIn: true,
    leaveBalances: { casual: 12, sick: 10, earned: 15 },
  },
  {
    _id: "mock_hr_mgr",
    orgId: "org_default",
    empName: "Shalini Rao",
    empAge: 31,
    empPosition: "HR Manager",
    email: "shalini.rao@company.in",
    profilePhoto: "",
    department: "Human Resources",
    status: "active",
    salary: 140050,
    clockedIn: false,
    leaveBalances: { casual: 10, sick: 9, earned: 12 },
  },
  {
    _id: "mock_hr_coordinator",
    orgId: "org_default",
    empName: "Rahul Deshmukh",
    empAge: 25,
    empPosition: "HR Coordinator",
    email: "rahul.deshmukh@company.in",
    profilePhoto: "",
    department: "Human Resources",
    status: "active",
    salary: 80000,
    clockedIn: true,
    leaveBalances: { casual: 14, sick: 10, earned: 11 },
  },
];

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI is not defined. Falling back to local mock data.");
      return NextResponse.json({ success: true, data: localMockEmployees });
    }

    await dbConnect();
    let employees = await Employee.find({ orgId: "org_default" }).sort({ createdAt: -1 });

    // Seed database if empty
    if (employees.length === 0) {
      await Employee.insertMany(
        localMockEmployees.map((e) => ({
          orgId: e.orgId,
          empName: e.empName,
          empAge: e.empAge,
          empPosition: e.empPosition,
          email: e.email,
          profilePhoto: e.profilePhoto,
          department: e.department,
          status: e.status,
          salary: e.salary,
          clockedIn: e.clockedIn,
          leaveBalances: e.leaveBalances,
        }))
      );
      employees = await Employee.find({ orgId: "org_default" }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data: employees });
  } catch (error: any) {
    console.error("Database connection error in GET /api/employees:", error);
    return NextResponse.json({
      success: true,
      data: localMockEmployees,
      warning: "Database connection failed. Displaying temporary offline data.",
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { empName, empAge, empPosition, email, department, salary } = body;

    if (!empName || !empAge || !empPosition) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const defaultEmail = email || `${empName.toLowerCase().replace(/\s+/g, ".")}@company.in`;
    const defaultDept = department || "Engineering";
    const defaultSalary = salary ? Number(salary) : 95000;

    if (!process.env.MONGODB_URI) {
      const newMockEmployee = {
        _id: `mock_${Date.now()}`,
        orgId: "org_default",
        empName,
        empAge: Number(empAge),
        empPosition,
        email: defaultEmail,
        profilePhoto: "",
        department: defaultDept,
        status: "active",
        salary: defaultSalary,
        clockedIn: false,
        leaveBalances: { casual: 12, sick: 10, earned: 15 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      localMockEmployees = [newMockEmployee, ...localMockEmployees];
      return NextResponse.json({ success: true, data: newMockEmployee });
    }

    await dbConnect();
    const employee = await Employee.create({
      orgId: "org_default",
      empName,
      empAge: Number(empAge),
      empPosition,
      email: defaultEmail,
      department: defaultDept,
      salary: defaultSalary,
      status: "active",
      clockedIn: false,
      leaveBalances: { casual: 12, sick: 10, earned: 15 },
    });

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    console.error("Database error in POST /api/employees:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create employee" },
      { status: 500 }
    );
  }
}
