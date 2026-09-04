import { NextResponse } from "next/server";
import axios from "axios";
import { parseResumePDF, parseResumeTextFallback, getMockScreeningResult } from "@/lib/gemini";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    let decoded = await verifyToken(req);
    let forceMockParsing = false;
    if (!decoded || decoded.isSandbox) {
      forceMockParsing = true;
      if (!decoded) {
        const isDevOrMock = 
          process.env.NODE_ENV === "development" ||
          !process.env.GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY.includes("your_gemini_key");
          
        if (isDevOrMock) {
          decoded = {
            role: "platform_admin",
            orgId: "6a2161415b2d4dbff95e7c0c",
            email: "mock-admin@orgcontrol.com"
          };
        } else {
          return NextResponse.json(
            { success: false, error: "Unauthorized: Invalid or missing token" },
            { status: 401 }
          );
        }
      }
    }

    const { name, email, phone, jobTitle, resumeUrl, resumeText } = await req.json();

    if (!name || !email || !jobTitle) {
      return NextResponse.json(
        { success: false, error: "Missing candidate credentials for parsing" },
        { status: 400 }
      );
    }

    // Fast-path: If pre-extracted resumeText is provided, parse directly without downloading PDF
    if (resumeText && typeof resumeText === "string" && resumeText.trim().length > 50) {
      try {
        const aiResult = await parseResumeTextFallback(resumeText.trim(), jobTitle, name);
        return NextResponse.json({ success: true, data: aiResult });
      } catch (textErr: any) {
        console.warn("Fast text parse failed, falling back to PDF download:", textErr?.message);
      }
    }

    let pdfBuffer: Buffer | null = null;

    if (resumeUrl) {
      try {
        console.log(`Downloading resume PDF from Cloudinary: ${resumeUrl}`);
        const response = await axios.get(resumeUrl, {
          responseType: "arraybuffer",
          timeout: 15000,
        });
        pdfBuffer = Buffer.from(response.data);
      } catch (downloadErr: any) {
        console.error(`Failed to download resume from url "${resumeUrl}":`, downloadErr.message);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to download resume PDF: ${downloadErr.message}`,
          },
          { status: 400 }
        );
      }
    }

    if (!pdfBuffer) {
      return NextResponse.json(
        {
          success: false,
          error: "No resume PDF provided or found.",
        },
        { status: 400 }
      );
    }

    try {
      const aiResult = await parseResumePDF(pdfBuffer, jobTitle, name);
      return NextResponse.json({ success: true, data: aiResult });
    } catch (err: any) {
      console.error("Gemini API call failed:", err);
      return NextResponse.json(
        { success: false, error: `Gemini parsing failed: ${err.message}` },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("AI Parsing endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
