import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Employee from "@/models/Employee";
import Organization from "@/models/Organization";
import PlatformOwner from "@/models/PlatformOwner";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password, loginType } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // SaaS Maker Login (Platform Owner)
    if (loginType === "admin") {
      const adminUser = await PlatformOwner.findOne({ email });
      if (!adminUser || adminUser.password !== password) {
        return NextResponse.json(
          { success: false, error: "Invalid SaaS Maker credentials." },
          { status: 401 }
        );
      }
      const responsePayload = {
        id: adminUser._id.toString(),
        name: adminUser.name,
        email: adminUser.email,
        role: "platform_admin" as const,
        orgId: "platform_layer",
      };
      const token = signToken(responsePayload);
      const response = NextResponse.json({
        success: true,
        user: responsePayload,
      });
      response.cookies.set("org_control_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });
      return response;
    }

    // Organization Login (HR Admin or Employee)
    const user = await Employee.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials or account does not exist." },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Check organization status
    const org = await Organization.findById(user.orgId);
    if (!org) {
      return NextResponse.json(
        { success: false, error: "Organization tenant not found." },
        { status: 404 }
      );
    }
    
    if (org.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Your organization's account is currently suspended. Please contact the platform administrator." },
        { status: 403 }
      );
    }

    // Determine the user's base role
    const isHrAdmin = user.department === "Human Resources" && (
      user.empPosition.toLowerCase().includes("head") || 
      user.empPosition.toLowerCase().includes("chro")
    );
    const role = isHrAdmin ? "org_admin" : "employee";

    const responsePayload = {
      id: user._id.toString(),
      name: user.empName,
      email: user.email,
      role: role as any,
      orgId: user.orgId.toString(),
      department: user.department,
      position: user.empPosition,
    };
    const token = signToken(responsePayload);
    const response = NextResponse.json({
      success: true,
      user: responsePayload,
    });
    response.cookies.set("org_control_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return response;

  } catch (error: any) {
    console.error("Auth Login Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
