import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import JobPosting from "@/models/JobPosting";
import Candidate from "@/models/Candidate";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const all = searchParams.get("all") === "true";
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    await dbConnect();
    const query: any = {};
    if (orgId) {
      query.orgId = orgId;
    }

    if (status && status !== "all") {
      query.status = status;
    } else if (!all) {
      query.status = "active";
    } else {
      query.status = { $in: ["active", "inactive", "archived"] };
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (search) {
      const regex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      query.$or = [
        { title: regex },
        { department: regex },
        { location: regex },
        { type: regex },
      ];
    }

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const jobs = await JobPosting.find(query).lean();

    // Fetch applicant count for each job
    let jobsWithCounts = await Promise.all(
      jobs.map(async (job: any) => {
        const count = await Candidate.countDocuments({ jobId: job._id });
        return {
          ...job,
          applicantCount: count,
        };
      }),
    );

    // Dynamic sorting in memory
    jobsWithCounts.sort((a: any, b: any) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "applicantCount") {
        const diff = (aVal ?? 0) - (bVal ?? 0);
        return sortOrder === 1 ? diff : -diff;
      }

      const left = String(aVal ?? "").toLowerCase();
      const right = String(bVal ?? "").toLowerCase();
      const result = left.localeCompare(right);
      return sortOrder === 1 ? result : -result;
    });

    const total = jobsWithCounts.length;
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (pageParam) {
      const startIndex = (page - 1) * limit;
      jobsWithCounts = jobsWithCounts.slice(startIndex, startIndex + limit);
    }

    return NextResponse.json({
      success: true,
      data: jobsWithCounts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/jobs Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing token" },
        { status: 401 },
      );
    }

    if (decoded.isSandbox) {
      return NextResponse.json(
        { success: false, error: "Operation not performable in Mock" },
        { status: 403 },
      );
    }

    await dbConnect();
    const body = await req.json();
    const {
      orgId,
      title,
      department,
      location,
      type,
      description,
      requirements,
    } = body;

    if (!orgId || !title || !department || !location || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newJob = await JobPosting.create({
      orgId,
      title,
      department,
      location,
      type: type || "Full-time",
      description,
      requirements: requirements || [],
      status: "active",
    });

    return NextResponse.json({ success: true, data: newJob }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/jobs Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
