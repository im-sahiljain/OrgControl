import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, phone, jobTitle, resumeUrl } = await req.json();

    if (!name || !email || !jobTitle) {
      return NextResponse.json(
        { success: false, error: "Missing candidate credentials for parsing" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const isMockKey = !apiKey || apiKey.includes("your_openai_key");

    // If no real OpenAI API Key is configured, do not mock-screen. Return a clean error.
    if (isMockKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API Key is missing or invalid. Please configure OPENAI_API_KEY in your .env file to run live AI screening.",
        },
        { status: 400 },
      );
    }

    try {
      const OpenAI = eval('require')("openai");
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI Recruitment Assistant screening candidates for a multi-tenant SaaS. You must output structured JSON only.",
          },
          {
            role: "user",
            content: `Analyze candidate "${name}" applying for "${jobTitle}".
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
          },
        ],
        response_format: { type: "json_object" },
      });

      const rawText = response.choices[0]?.message?.content || "{}";
      const aiResult = JSON.parse(rawText);

      return NextResponse.json({ success: true, data: aiResult });
    } catch (err: any) {
      console.error("OpenAI API call failed:", err);
      return NextResponse.json(
        { success: false, error: `OpenAI API call failed: ${err.message}` },
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
