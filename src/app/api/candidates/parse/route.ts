import { NextResponse } from "next/server";
import axios from "axios";
import { parseResumePDF, parseResumeTextFallback } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { name, email, phone, jobTitle, resumeUrl } = await req.json();

    if (!name || !email || !jobTitle) {
      return NextResponse.json(
        { success: false, error: "Missing candidate credentials for parsing" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isMockKey = !apiKey || apiKey.includes("your_gemini_key");

    if (isMockKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEMINI_API_KEY is missing or invalid. Please configure GEMINI_API_KEY in your .env file to run live AI screening.",
        },
        { status: 400 }
      );
    }

    let pdfBuffer: Buffer | null = null;

    if (resumeUrl) {
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
      if (pdfBuffer) {
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
