import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import Employee from "@/models/Employee";

import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded || decoded.role !== "platform_admin") {
      return NextResponse.json({ success: false, error: "Unauthorized: SaaS Maker Admin permissions required" }, { status: 401 });
    }

    await dbConnect();
    const organizations = await Organization.find({}).lean();
    
    // Map plans to rough MRR estimates (in INR)
    const PLAN_PRICES: Record<string, number> = {
      starter: 4999,
      professional: 12999,
      enterprise: 49999, // Custom, but we use a baseline for metrics
    };

    let totalMRR = 0;
    const formattedTenants = await Promise.all(
      organizations.map(async (org: any) => {
        // Only count MRR for active tenants
        if (org.status === "active") {
          totalMRR += PLAN_PRICES[org.plan.toLowerCase()] || 0;
        }

        // Count actual workforce size from the Employee collection
        const activeWorkforce = await Employee.countDocuments({ orgId: org.slug, status: "active" });

        return {
          id: org._id.toString(),
          name: org.name,
          slug: org.slug,
          plan: org.plan.charAt(0).toUpperCase() + org.plan.slice(1),
          status: org.status,
          employees: activeWorkforce,
          createdAt: org.createdAt,
        };
      })
    );

    const activeSubscribers = formattedTenants.filter(t => t.status === "active").length;
    const suspendedSubscribers = formattedTenants.length - activeSubscribers;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          globalMrr: totalMRR,
          totalOrgs: formattedTenants.length,
          activeSubscribers,
          suspendedSubscribers,
        },
        tenants: formattedTenants.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), // Newest first
      },
    });

  } catch (error: any) {
    console.error("Admin Dashboard Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching platform metrics." },
      { status: 500 }
    );
  }
}
