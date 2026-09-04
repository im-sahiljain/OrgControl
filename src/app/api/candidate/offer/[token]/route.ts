import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Candidate from "@/models/Candidate";
import JobPosting from "@/models/JobPosting";

// GET /api/candidate/offer/[token] - Public verification & viewing of job offer details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await dbConnect();
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Offer token is required" },
        { status: 400 }
      );
    }

    const candidate = await Candidate.findOne({ offerToken: token });

    if (!candidate) {
      return NextResponse.json(
        { error: "Invalid or expired offer link" },
        { status: 404 }
      );
    }

    // Fetch associated job title
    const job = await JobPosting.findById(candidate.jobId).select("title department location");

    return NextResponse.json({
      success: true,
      data: {
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        jobTitle: job?.title || candidate.offerDetails?.designation || "Position Offered",
        department: job?.department || "Operations",
        location: job?.location || "Remote / Hybrid",
        offerStatus: candidate.offerStatus || "pending",
        offerDetails: candidate.offerDetails,
        stage: candidate.stage,
      },
    });
  } catch (error: any) {
    console.error("Error fetching offer by token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/candidate/offer/[token] - Candidate responds to job offer (Accept / Decline)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await dbConnect();
    const { token } = await params;
    const { action } = await req.json();

    if (!token || !["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Valid token and action ('accept' or 'decline') are required" },
        { status: 400 }
      );
    }

    const candidate = await Candidate.findOne({ offerToken: token });

    if (!candidate) {
      return NextResponse.json(
        { error: "Invalid or expired offer link" },
        { status: 404 }
      );
    }

    if (candidate.offerStatus === "accepted" || candidate.offerStatus === "declined") {
      return NextResponse.json(
        { error: `This offer has already been ${candidate.offerStatus}` },
        { status: 400 }
      );
    }

    const newOfferStatus = action === "accept" ? "accepted" : "declined";
    candidate.offerStatus = newOfferStatus;

    if (!candidate.offerDetails) {
      candidate.offerDetails = {};
    }
    candidate.offerDetails.respondedAt = new Date();

    if (action === "decline") {
      candidate.stage = "rejected";
    }

    await candidate.save();

    return NextResponse.json({
      success: true,
      message: `Offer successfully ${newOfferStatus}`,
      data: {
        offerStatus: candidate.offerStatus,
        respondedAt: candidate.offerDetails.respondedAt,
      },
    });
  } catch (error: any) {
    console.error("Error processing candidate offer decision:", error);
    return NextResponse.json(
      { error: "Failed to record offer decision" },
      { status: 500 }
    );
  }
}
