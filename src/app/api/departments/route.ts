import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Department from "@/models/Department";

let localMockDepartments = [
  { 
    _id: "dept_1", 
    orgId: "org_default", 
    name: "Engineering", 
    description: "Core product builders", 
    headIds: ["mock_eng_head"], 
    budget: { annual: 250000, currency: "USD" }, 
    status: "active",
    managers: [
      { managerId: "mock_eng_mgr", memberIds: ["mock_eng_dev"] }
    ],
    enabledWidgets: ["sprint_tracker", "treasury_ledger"]
  },
  { 
    _id: "dept_2", 
    orgId: "org_default", 
    name: "Sales", 
    description: "Revenue & client operations", 
    headIds: ["mock_sales_head"], 
    budget: { annual: 180500, currency: "USD" }, 
    status: "active",
    managers: [
      { managerId: "mock_sales_mgr", memberIds: ["mock_sales_rep"] }
    ],
    enabledWidgets: ["sales_pipeline"]
  },
  { 
    _id: "dept_3", 
    orgId: "org_default", 
    name: "Finance", 
    description: "Treasury & financial controllers", 
    headIds: ["mock_fin_head"], 
    budget: { annual: 150000, currency: "USD" }, 
    status: "active",
    managers: [
      { managerId: "mock_fin_mgr", memberIds: ["mock_fin_analyst"] }
    ],
    enabledWidgets: ["treasury_ledger"]
  },
  { 
    _id: "dept_4", 
    orgId: "org_default", 
    name: "Human Resources", 
    description: "Talent operations & employee care", 
    headIds: ["mock_hr_head"], 
    budget: { annual: 95000, currency: "USD" }, 
    status: "active",
    managers: [
      { managerId: "mock_hr_mgr", memberIds: ["mock_hr_coordinator"] }
    ],
    enabledWidgets: ["recruitment_funnel"]
  },
];

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, data: localMockDepartments });
    }

    await dbConnect();
    let departments = await Department.find({ orgId: "org_default" }).sort({ createdAt: -1 });

    // Seed database if empty
    if (departments.length === 0) {
      await Department.insertMany(
        localMockDepartments.map((d) => ({
          orgId: d.orgId,
          name: d.name,
          description: d.description,
          headIds: d.headIds,
          budget: d.budget,
          status: d.status,
          managers: d.managers,
          enabledWidgets: d.enabledWidgets,
        }))
      );
      departments = await Department.find({ orgId: "org_default" }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data: departments });
  } catch (error: any) {
    console.error("Database connection error in GET /api/departments:", error);
    return NextResponse.json({
      success: true,
      data: localMockDepartments,
      warning: "Database connection failed. Displaying offline departments.",
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, budget, headIds, managers, enabledWidgets } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Department name is required" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      const newMockDept = {
        _id: `dept_${Date.now()}`,
        orgId: "org_default",
        name,
        description: description || "",
        headIds: headIds || [],
        budget: budget || { annual: 50000, currency: "USD" },
        status: "active",
        managers: managers || [],
        enabledWidgets: enabledWidgets || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      localMockDepartments = [newMockDept, ...localMockDepartments];
      return NextResponse.json({ success: true, data: newMockDept });
    }

    await dbConnect();
    const department = await Department.create({
      orgId: "org_default",
      name,
      description: description || "",
      headIds: headIds || [],
      budget: budget || { annual: 50000, currency: "USD" },
      status: "active",
      managers: managers || [],
      enabledWidgets: enabledWidgets || [],
    });

    return NextResponse.json({ success: true, data: department });
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
    const body = await req.json();
    const { id, headIds, managers, enabledWidgets, budget } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Department ID is required" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      const deptIdx = localMockDepartments.findIndex((d) => d._id === id);
      if (deptIdx !== -1) {
        const updated = {
          ...localMockDepartments[deptIdx],
          headIds: headIds !== undefined ? headIds : localMockDepartments[deptIdx].headIds,
          managers: managers !== undefined ? managers : localMockDepartments[deptIdx].managers,
          enabledWidgets: enabledWidgets !== undefined ? enabledWidgets : localMockDepartments[deptIdx].enabledWidgets,
          budget: budget !== undefined ? budget : localMockDepartments[deptIdx].budget,
        };
        localMockDepartments[deptIdx] = updated;
        return NextResponse.json({ success: true, data: updated });
      }
      return NextResponse.json({ success: false, error: "Department not found in mock store" }, { status: 404 });
    }

    await dbConnect();
    const updatedDept = await Department.findByIdAndUpdate(
      id,
      {
        ...(headIds !== undefined && { headIds }),
        ...(managers !== undefined && { managers }),
        ...(enabledWidgets !== undefined && { enabledWidgets }),
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
