import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DashboardModule from "@/models/DashboardModule";

// Local mock data store for offline development
let localMockModules = [
  {
    _id: "sprint_tracker",
    orgId: "org_default",
    name: "Engineering Sprint Board",
    description: "Uptimes, active branches, trigger build simulator.",
    icon: "Terminal",
    color: "blue",
    status: "active",
    fields: [
      { name: "Pull Request ID", type: "number" },
      { name: "Branch Name", type: "text" },
      { name: "Status", type: "select", options: ["Open", "In Review", "Merged"] }
    ]
  },
  {
    _id: "sales_pipeline",
    orgId: "org_default",
    name: "Sales CRM Pipeline Funnel",
    description: "CRM opportunities log form, representative leaderboard.",
    icon: "TrendingUp",
    color: "emerald",
    status: "active",
    fields: [
      { name: "Client Account Name", type: "text" },
      { name: "Deal Amount (INR)", type: "number" },
      { name: "Deal Stage", type: "select", options: ["Prospecting", "Proposal", "Closed Won"] }
    ]
  },
  {
    _id: "treasury_ledger",
    orgId: "org_default",
    name: "Finance Treasury Reimbursements",
    description: "Cost center lists, log expenses claims directly.",
    icon: "Coins",
    color: "violet",
    status: "active",
    fields: [
      { name: "Expense Title", type: "text" },
      { name: "Amount (INR)", type: "number" },
      { name: "Category", type: "select", options: ["Operations", "Infrastructure", "Travel", "Misc"] }
    ]
  },
  {
    _id: "recruitment_funnel",
    orgId: "org_default",
    name: "HR Recruitment Onboarding",
    description: "Candidate interview scheduler, pulse sentiment boards.",
    icon: "CalendarCheck2",
    color: "amber",
    status: "active",
    fields: [
      { name: "Candidate Name", type: "text" },
      { name: "Job Position", type: "text" },
      { name: "Interview Status", type: "select", options: ["Screening", "Technical", "Culture Fit", "Offer Made"] }
    ]
  }
];

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, data: localMockModules });
    }

    await dbConnect();
    let modules = await DashboardModule.find({ orgId: "org_default" }).sort({ createdAt: -1 });

    // Seed database if empty
    if (modules.length === 0) {
      await DashboardModule.insertMany(
        localMockModules.map((m) => ({
          _id: m._id, // Hardcode IDs for the seed so department mocks match them
          orgId: m.orgId,
          name: m.name,
          description: m.description,
          icon: m.icon,
          color: m.color,
          status: m.status,
          fields: m.fields,
        }))
      );
      modules = await DashboardModule.find({ orgId: "org_default" }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data: modules });
  } catch (error: any) {
    console.error("Database connection error in GET /api/modules:", error);
    return NextResponse.json({
      success: true,
      data: localMockModules,
      warning: "Database connection failed. Displaying offline modules.",
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, icon, color, fields } = body;

    if (!name || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ success: false, error: "Module name and fields are required" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      const newMockModule = {
        _id: `mod_${Date.now()}`,
        orgId: "org_default",
        name,
        description: description || "",
        icon: icon || "Layout",
        color: color || "blue",
        fields,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      localMockModules = [newMockModule, ...localMockModules];
      return NextResponse.json({ success: true, data: newMockModule });
    }

    await dbConnect();
    const newModule = await DashboardModule.create({
      orgId: "org_default",
      name,
      description: description || "",
      icon: icon || "Layout",
      color: color || "blue",
      fields,
      status: "active",
    });

    return NextResponse.json({ success: true, data: newModule });
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
    const body = await req.json();
    const { id, name, description, icon, color, fields, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Module ID is required" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      const modIdx = localMockModules.findIndex((m) => m._id === id);
      if (modIdx !== -1) {
        const updated = {
          ...localMockModules[modIdx],
          name: name || localMockModules[modIdx].name,
          description: description !== undefined ? description : localMockModules[modIdx].description,
          icon: icon || localMockModules[modIdx].icon,
          color: color || localMockModules[modIdx].color,
          fields: fields || localMockModules[modIdx].fields,
          status: status || localMockModules[modIdx].status,
        };
        localMockModules[modIdx] = updated;
        return NextResponse.json({ success: true, data: updated });
      }
      return NextResponse.json({ success: false, error: "Module not found in mock store" }, { status: 404 });
    }

    await dbConnect();
    const updatedModule = await DashboardModule.findByIdAndUpdate(
      id,
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Module ID is required" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      localMockModules = localMockModules.filter((m) => m._id !== id);
      return NextResponse.json({ success: true, message: "Module deleted from mock store" });
    }

    await dbConnect();
    const deleted = await DashboardModule.findByIdAndDelete(id);
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
