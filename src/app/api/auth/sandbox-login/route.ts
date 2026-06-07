import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (!payload || !payload.id) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const token = signToken(payload);
    
    const response = NextResponse.json({
      success: true,
      user: payload,
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
    console.error("Sandbox Login Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
