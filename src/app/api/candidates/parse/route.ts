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

    const { name, email, phone, jobTitle, resumeUrl } = await req.json();

    if (!name || !email || !jobTitle) {
      return NextResponse.json(
        { success: false, error: "Missing candidate credentials for parsing" },
        { status: 400 }
      );
    }

    let pdfBuffer: Buffer | null = null;

    // Skip PDF download if we are bypassing the live parser
    if (resumeUrl && !forceMockParsing) {
      try {
        console.log(`Downloading resume PDF from Cloudinary: ${resumeUrl}`);
        const response = await axios.get(resumeUrl, {
          responseType: "arraybuffer",
          timeout: 8000, // 8-second download timeout
        });
        pdfBuffer = Buffer.from(response.data);
      } catch (downloadErr: any) {
        console.warn(
          `Failed to download resume from url "${resumeUrl}". Falling back to text-based evaluation.`,
          downloadErr.message
        );
      }
    }

    try {
      let aiResult;
      if (forceMockParsing) {
        console.log(`[RAG Ingestion] Bypassing live Gemini API because user is not logged in. Using mock screening result.`);
        aiResult = getMockScreeningResult(name, jobTitle);
      } else if (pdfBuffer) {
        aiResult = await parseResumePDF(pdfBuffer, jobTitle, name);
      } else {
        const candidateInfoText = `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nJob: ${jobTitle}`;
        aiResult = await parseResumeTextFallback(candidateInfoText, jobTitle, name);
      }

      console.log("AI screening result:", aiResult);
      return NextResponse.json({ success: true, data: aiResult });
    } catch (err: any) {
      console.error("Gemini API call failed:", err);
      return NextResponse.json(
        { success: false, error: `Gemini API call failed: ${err.message}` },
        { status: 550 }
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
