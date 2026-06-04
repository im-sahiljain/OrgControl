import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  
  // Clear the org_control_token cookie by setting it to empty and expiring it immediately
  response.cookies.set("org_control_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  
  return response;
}
