import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Organization from "@/models/Organization";
import Employee from "@/models/Employee";
import Department from "@/models/Department";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { companyName, adminName, adminEmail, password, plan } = body;

    if (!companyName || !adminName || !adminEmail || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 }
      );
    }

    // Generate a slug for the organization
    const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await Organization.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 1. Create the Organization Tenant
    const newOrg = await Organization.create({
      name: companyName,
      slug,
      plan: plan === "starter" ? "Starter" : plan === "professional" ? "Professional" : "Enterprise",
      adminEmail,
      status: "active",
    });

    const orgId = newOrg._id; // Use the document ObjectId, not slug

    // 2. Create the Founding Admin (HR Head)
    const adminUser = await Employee.create({
      orgId,
      empName: adminName,
      empAge: 30,
      empPosition: "CHRO (Head of HR)",
      email: adminEmail,
      password,
      department: "Human Resources",
      status: "active",
      salary: 0,
      clockedIn: false,
    });

    // 3. Initialize a default Human Resources department
    await Department.create({
      orgId,
      slug: "hr",
      name: "Human Resources",
      description: "Default department created during organization onboarding.",
      isPredefined: true,
      headIds: [adminUser._id.toString()],
      managers: [],
      budget: { annual: 100000, currency: "INR" },
      status: "active",
    });

    return NextResponse.json({
      success: true,
      message: "Organization provisioned successfully.",
      orgId: orgId.toString(),
      adminId: adminUser._id.toString(),
    });
  } catch (error: any) {
    console.error("Organization Registration Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register organization." },
      { status: 500 }
    );
  }
}
