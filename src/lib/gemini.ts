import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("your_gemini_key")) {
    throw new Error(
      "GEMINI_API_KEY is missing or invalid. Please configure GEMINI_API_KEY in your .env file.",
    );
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a 768-dimensional vector embedding for a given text query or document.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getAiClient();
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
  });

  if (
    !response.embeddings ||
    response.embeddings.length === 0 ||
    !response.embeddings[0].values
  ) {
    throw new Error("Failed to generate embedding from Gemini API.");
  }
  return response.embeddings[0].values;
}

interface ParsedResumeResult {
  matchScore: number;
  skills: string[];
  summary: string;
  pros: string[];
  cons: string[];
  interviewQuestions: { question: string; focusArea: string }[];
  extractedResumeText: string;
}

/**
 * Parses candidate resume PDF using Gemini's native document support.
 * Returns structured screening insights and full text extraction for RAG indexing.
 */
export async function parseResumePDF(
  pdfBuffer: Buffer,
  jobTitle: string,
  candidateName: string,
): Promise<ParsedResumeResult> {
  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: "Gemini 3.1 Flash Lite",
    contents: [
      {
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf",
        },
      },
      `Analyze the attached resume for candidate "${candidateName}" applying for the role of "${jobTitle}".
      Perform an assessment of their fit and generate the following structured JSON output:
      {
        "matchScore": number (0-100 score matching the job specifications),
        "skills": string[] (extracted key technical and professional skills),
        "summary": string (a comprehensive screening summary explaining candidate fit),
        "pros": string[] (key strengths, matching requirements, or standout highlights),
        "cons": string[] (areas of improvement, missing experiences, or candidate red flags),
        "interviewQuestions": [
          { "question": "suggested behavioral or technical question", "focusArea": "what this question evaluates" }
        ],
        "extractedResumeText": "string" (a clean, structured plain text transcription of all experience, projects, education, and skills sections from the resume for database indexing)
      }`,
    ],
    config: {
      systemInstruction:
        "You are an AI Recruitment Assistant screening candidates. You must transcribe all resume details and evaluate candidate suitability. Output structured JSON only.",
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text || "{}";
  const result = JSON.parse(rawText);

  if (!result.extractedResumeText) {
    result.extractedResumeText = `${candidateName} - Applied for ${jobTitle}. Summary: ${result.summary || ""}. Skills: ${(result.skills || []).join(", ")}`;
  }

  return result;
}

/**
 * Normal fallback parser in case the resume PDF download fails or format is unsupported.
 */
export async function parseResumeTextFallback(
  candidateText: string,
  jobTitle: string,
  candidateName: string,
): Promise<ParsedResumeResult> {
  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: "Gemini 3.1 Flash Lite",
    contents: `Analyze candidate "${candidateName}" applying for "${jobTitle}".
    Profile Information:
    ${candidateText}

    Generate the following structured JSON output:
    {
      "matchScore": number (0-100),
      "skills": string[],
      "summary": string,
      "pros": string[],
      "cons": string[],
      "interviewQuestions": [
        { "question": "string", "focusArea": "string" }
      ],
      "extractedResumeText": "string" (summarize all details here)
    }`,
    config: {
      systemInstruction:
        "You are an AI Recruitment Assistant. Evaluate candidate fit based on the text. Output structured JSON only.",
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text || "{}";
  return JSON.parse(rawText);
}
