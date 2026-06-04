import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SalesDeal from "@/models/SalesDeal";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const assignedTo = searchParams.get("assignedTo");
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ success: false, error: "orgId query parameter is required" }, { status: 400 });
    }

    const query: any = { orgId };
    if (assignedTo) {
      // Depending on data scope, a user might see all deals, team deals, or only their own.
      // We'll support filtering by assignedTo for "Personal" scope.
      query.assignedTo = assignedTo;
    }

    const deals = await SalesDeal.find(query).sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, data: deals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.orgId) {
      return NextResponse.json({ success: false, error: "orgId is required in body" }, { status: 400 });
    }

    const newDeal = await SalesDeal.create(body);

    return NextResponse.json({ success: true, data: newDeal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: "Deal ID required" }, { status: 400 });
    }

    const updatedDeal = await SalesDeal.findByIdAndUpdate(_id, updateData, { new: true });

    return NextResponse.json({ success: true, data: updatedDeal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
