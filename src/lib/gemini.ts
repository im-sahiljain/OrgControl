import { GoogleGenAI } from "@google/genai";

const isMockMode = (): boolean => {
  const apiKey = process.env.GEMINI_API_KEY;
  return !apiKey || apiKey.includes("your_gemini_key") || apiKey === "mock";
};

const getAiClient = () => {
  if (isMockMode()) {
    return null;
  }
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey: apiKey! });
};

/**
 * Deterministically generates a 3,072-dimensional vector embedding for mocks
 * so that similarity comparisons (RAG matching) work realistically in local environments.
 */
export function getDeterministicMockEmbedding(text: string): number[] {
  const embedding: number[] = [];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  for (let i = 0; i < 3072; i++) {
    const rawVal = Math.sin(hash + i) * 10000;
    const value = (rawVal - Math.floor(rawVal)) * 0.2 - 0.1; // Float value between -0.1 and 0.1
    embedding.push(value);
  }
  return embedding;
}

/**
 * Generates a 3,072-dimensional vector embedding for a given text query or document.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (isMockMode()) {
    return getDeterministicMockEmbedding(text);
  }

  const ai = getAiClient();
  if (!ai) throw new Error("AI client unavailable");
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

export interface ParsedResumeResult {
  matchScore: number;
  skills: string[];
  summary: string;
  pros: string[];
  cons: string[];
  interviewQuestions: { question: string; focusArea: string }[];
  extractedResumeText: string;
}

/**
 * Generates realistic mock screening results based on job title and candidate name.
 */
export function getMockScreeningResult(candidateName: string, jobTitle: string): ParsedResumeResult {
  const titleLower = jobTitle.toLowerCase();
  let skills = ["JavaScript", "TypeScript", "REST APIs", "Git", "Agile"];
  let summary = `Candidate ${candidateName} shows solid foundations as a software developer. They demonstrate standard knowledge of design patterns, software engineering principles, and database management systems. Recommended for next stages of screening.`;
  let pros = [
    "Strong problem-solving capabilities",
    "Familiar with modern version control workflows",
    "Clear structure and clean documentation in resume"
  ];
  let cons = [
    "Lacks specialized experience in heavy high-scale production systems",
    "Could benefit from deeper cloud infrastructure certification"
  ];
  let questions = [
    { question: `Can you explain a challenging project where you designed APIs for a ${jobTitle} role?`, focusArea: "System Design" },
    { question: "How do you handle debugging complex state interactions in a multi-tenant client app?", focusArea: "Problem Solving" }
  ];

  if (titleLower.includes("front") || titleLower.includes("react") || titleLower.includes("ui") || titleLower.includes("web")) {
    skills = ["React.js", "Redux Toolkit", "TypeScript", "Tailwind CSS", "Jest", "HTML5/CSS3", "TanStack Query"];
    summary = `Candidate ${candidateName} exhibits strong expertise in frontend engineering, specializing in React.js and state management tools like Redux. Their background shows active experience creating reusable components and optimizing render times.`;
    pros = [
      "Proficient with modern React rendering optimizations (useMemo, React.memo)",
      "Extensive experience translating Figma designs into responsive UIs",
      "Strong global state management knowledge using Redux Toolkit"
    ];
    cons = [
      "Familiarity with server-side rendering frameworks like Next.js could be deeper",
      "CSS layout styling details show minor consistency gaps"
    ];
    questions = [
      { question: "What strategies do you use to reduce unnecessary component re-renders in a complex React tree?", focusArea: "Performance Optimization" },
      { question: "How do you structure global state in Redux to keep actions and reducers clean and maintainable?", focusArea: "State Management" }
    ];
  } else if (titleLower.includes("back") || titleLower.includes("node") || titleLower.includes("mongo") || titleLower.includes("server")) {
    skills = ["Node.js", "Express.js", "MongoDB", "Mongoose", "REST APIs", "Docker", "Redis", "SQL"];
    summary = `Candidate ${candidateName} presents a solid backend background with extensive use of Node.js and Express to build RESTful web services. They show good understanding of database schemas, indexes, and aggregation queries.`;
    pros = [
      "Strong database modeling skills (MongoDB/Mongoose collections and indexes)",
      "Experience building robust, secured REST APIs with middleware validations",
      "Familiarity with containerization and caching systems like Docker and Redis"
    ];
    cons = [
      "Limited exposure to frontend UI development and integration",
      "Needs closer alignment on security best practices like rate limiting and token rotations"
    ];
    questions = [
      { question: "How would you design a MongoDB aggregation query to compile statistics across multiple collections?", focusArea: "Database Queries" },
      { question: "How do you secure server endpoints against SQL/NoSQL injection attacks and general load surges?", focusArea: "API Security" }
    ];
  }

  // Deterministic score based on candidate name length so it doesn't change on page reload
  const matchScore = 75 + (candidateName.length % 20);

  const extractedResumeText = `Candidate Name: ${candidateName}
Applied Position: ${jobTitle}
Skills: ${skills.join(", ")}
Summary of Experience: Professional experience working with ${skills.slice(0, 3).join(", ")}. Developed applications, resolved bugs, and participated in sprint meetings. Focused on writing testable, modular code.
Education: M.Sc. in Computer Science.`;

  return {
    matchScore,
    skills,
    summary,
    pros,
    cons,
    interviewQuestions: questions,
    extractedResumeText
  };
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
  if (isMockMode()) {
    return getMockScreeningResult(candidateName, jobTitle);
  }

  const ai = getAiClient();
  if (!ai) throw new Error("AI client unavailable");
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
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
  if (isMockMode()) {
    return getMockScreeningResult(candidateName, jobTitle);
  }

  const ai = getAiClient();
  if (!ai) throw new Error("AI client unavailable");
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
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
