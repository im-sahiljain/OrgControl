import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { name, email, phone, jobTitle, resumeUrl } = await req.json();

    if (!name || !email || !jobTitle) {
      return NextResponse.json(
        { success: false, error: "Missing candidate credentials for parsing" },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isMockKey = !apiKey || apiKey.includes("your_gemini_key");

    // If no real Gemini API Key is configured, do not mock-screen. Return a clean error.
    if (isMockKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GEMINI_API_KEY is missing or invalid. Please configure GEMINI_API_KEY in your .env file to run live AI screening.",
        },
        { status: 400 },
      );
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze candidate "${name}" applying for "${jobTitle}".
        Generate the following structured JSON output:
        {
          "matchScore": number (0-100),
          "skills": string[],
          "summary": string,
          "pros": string[],
          "cons": string[],
          "interviewQuestions": [
            { "question": "string", "focusArea": "string" }
          ]
        }`,
        config: {
          systemInstruction:
            "You are an AI Recruitment Assistant screening candidates for a multi-tenant SaaS. You must output structured JSON only.",
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text || "{}";
      const aiResult = JSON.parse(rawText);
      console.log("aiResult", aiResult);

      return NextResponse.json({ success: true, data: aiResult });
    } catch (err: any) {
      console.error("Gemini API call failed:", err);
      return NextResponse.json(
        { success: false, error: `Gemini API call failed: ${err.message}` },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("AI Parsing endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
