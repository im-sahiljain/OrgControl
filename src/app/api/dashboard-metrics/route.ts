import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Candidate from "@/models/Candidate";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: "orgId query parameter is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    const orgObjectId = mongoose.isValidObjectId(orgId)
      ? new mongoose.Types.ObjectId(orgId)
      : orgId;

    const [result] = await Candidate.aggregate([
      { $match: { orgId: orgObjectId } },
      {
        $group: {
          _id: null,
          totalResumes: { $sum: 1 },
          pendingScreenings: {
            $sum: {
              $cond: [{ $eq: ["$isAiScreened", false] }, 1, 0],
            },
          },
          highMatches: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isAiScreened", true] },
                    { $gte: ["$matchScore", 80] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          screenedScoreTotal: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isAiScreened", true] },
                    { $gt: ["$matchScore", 0] },
                  ],
                },
                "$matchScore",
                0,
              ],
            },
          },
          screenedScoreCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isAiScreened", true] },
                    { $gt: ["$matchScore", 0] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalResumes: 1,
          pendingScreenings: 1,
          highMatches: 1,
          avgMatchScore: {
            $cond: [
              { $gt: ["$screenedScoreCount", 0] },
              {
                $round: [
                  { $divide: ["$screenedScoreTotal", "$screenedScoreCount"] },
                  0,
                ],
              },
              0,
            ],
          },
        },
      },
    ]);

    console.log("result", result);

    return NextResponse.json({
      success: true,
      data: result || {
        totalResumes: 0,
        pendingScreenings: 0,
        highMatches: 0,
        avgMatchScore: 0,
      },
    });
  } catch (error: any) {
    console.error("GET /api/dashboard-metrics Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
