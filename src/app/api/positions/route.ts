import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import JobPosition from "@/models/JobPosition";

// Local mock data store for offline development
let localMockPositions = [
  { _id: "pos_1", orgId: "org_default", title: "Senior Software Engineer", department: "Engineering", description: "Lead technical architecture.", status: "active" },
  { _id: "pos_2", orgId: "org_default", title: "VP of Sales (Head)", department: "Sales", description: "Head of sales division.", status: "active" },
  { _id: "pos_3", orgId: "org_default", title: "CFO (Head)", department: "Finance", description: "Chief Financial Officer.", status: "active" },
  { _id: "pos_4", orgId: "org_default", title: "CHRO (Head of HR)", department: "Human Resources", description: "Chief HR Officer.", status: "active" },
  { _id: "pos_5", orgId: "org_default", title: "Engineering Manager", department: "Engineering", description: "Manage dev pods.", status: "active" },
  { _id: "pos_6", orgId: "org_default", title: "Finance Manager", department: "Finance", description: "Manage ledger accounts.", status: "active" },
  { _id: "pos_7", orgId: "org_default", title: "HR Manager", department: "Human Resources", description: "Manage recruitment.", status: "active" },
  { _id: "pos_8", orgId: "org_default", title: "Sales Manager", department: "Sales", description: "Manage SDR teams.", status: "active" },
  { _id: "pos_9", orgId: "org_default", title: "SDE", department: "Engineering", description: "Software dev.", status: "active" },
  { _id: "pos_10", orgId: "org_default", title: "Financial Analyst", department: "Finance", description: "Audit reports.", status: "active" },
  { _id: "pos_11", orgId: "org_default", title: "Account Executive", department: "Sales", description: "Close deals.", status: "active" },
];

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, data: localMockPositions });
    }

    await dbConnect();
    let positions = await JobPosition.find({ orgId: "org_default", status: "active" }).sort({ title: 1 });

    // Seed database if empty with default positions so the app isn't bare
    if (positions.length === 0) {
      await JobPosition.insertMany(
        localMockPositions.map((p) => ({
          orgId: p.orgId,
          title: p.title,
          department: p.department,
          description: p.description,
          status: p.status,
        }))
      );
      positions = await JobPosition.find({ orgId: "org_default", status: "active" }).sort({ title: 1 });
    }

    return NextResponse.json({ success: true, data: positions });
  } catch (error: any) {
    console.error("Database connection error in GET /api/positions:", error);
    return NextResponse.json({
      success: true,
      data: localMockPositions,
      warning: "Database connection failed. Displaying offline positions.",
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, department } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Position title is required" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      const newPos = {
        _id: `pos_${Date.now()}`,
        orgId: "org_default",
        title,
        description: description || "",
        department: department || "Unassigned",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      localMockPositions = [...localMockPositions, newPos];
      return NextResponse.json({ success: true, data: newPos });
    }

    await dbConnect();
    
    // Check if position title already exists
    const existing = await JobPosition.findOne({ orgId: "org_default", title });
    if (existing) {
      return NextResponse.json({ success: false, error: "Position title already exists." }, { status: 400 });
    }

    const newPos = await JobPosition.create({
      orgId: "org_default",
      title,
      description: description || "",
      department: department || "Unassigned",
      status: "active",
    });

    return NextResponse.json({ success: true, data: newPos });
  } catch (error: any) {
    console.error("Database error in POST /api/positions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create position" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Position ID is required" }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      localMockPositions = localMockPositions.filter((p) => p._id !== id);
      return NextResponse.json({ success: true, message: "Position deleted from mock store" });
    }

    await dbConnect();
    const deleted = await JobPosition.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Position not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Position deleted successfully" });
  } catch (error: any) {
    console.error("Database error in DELETE /api/positions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete position" },
      { status: 500 }
    );
  }
}
