import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export function signToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export async function verifyToken(req?: Request): Promise<any | null> {
  try {
    // 1. Try to read from HTTP-only Cookie
    const cookieStore = await cookies();
    const tokenFromCookie = cookieStore.get("org_control_token")?.value;
    
    if (tokenFromCookie) {
      return jwt.verify(tokenFromCookie, JWT_SECRET);
    }

    // 2. Fallback to Authorization Header
    if (req) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const tokenFromHeader = authHeader.substring(7);
        return jwt.verify(tokenFromHeader, JWT_SECRET);
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}
