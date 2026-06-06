# RAG & Vector Search Pipeline Documentation

This document describes the architectural flow, component details, and matching logic for the Retrieval-Augmented Generation (RAG) and Vector Search pipeline in the AI Automated Resume Reviewer.

---

## 🖥️ System Architecture Design

```mermaid
graph LR
    subgraph Client [Client UI]
        Dashboard[ResumeReviewDashboardWidget]
        Pipeline[RecruitmentPipeline]
    end

    subgraph CDN [Cloud CDN]
        Cloudinary[(Cloudinary Media Storage)]
    end

    subgraph API [Next.js API Routes / Vercel]
        ParseRoute[/api/candidates/parse]
        CandRoute[/api/candidates]
        MatchRoute[/api/candidates/match]
    end

    subgraph Models [Gemini AI Service]
        GeminiFlash[gemini-3.5-flash]
        GeminiEmbed[gemini-embedding-2]
    end

    subgraph Storage [Database]
        MongoDB[(MongoDB Atlas Vector Search)]
    end

    Dashboard & Pipeline -->|GET / POST / PUT| API
    Cloudinary -->|Reference URL| API
    ParseRoute -->|Download PDF| Cloudinary
    ParseRoute -->|Extract structured data & text| GeminiFlash
    CandRoute -->|Generate vector embedding| GeminiEmbed
    MatchRoute -->|Generate query embedding| GeminiEmbed
    CandRoute -->|Save candidates & vectors| MongoDB
    MatchRoute -->|vectorSearch or similarity match| MongoDB
```

---

## 🗺️ Visual Flowchart (End-to-End)

```mermaid
graph TD
    %% Styling
    classDef process fill:#f4f4f5,stroke:#d4d4d8,stroke-width:2px,color:#18181b;
    classDef ai fill:#ede9fe,stroke:#c084fc,stroke-width:2px,color:#581c87;
    classDef database fill:#eff6ff,stroke:#60a5fa,stroke-width:2px,color:#1e3a8a;
    classDef trigger fill:#ecfdf5,stroke:#34d399,stroke-width:2px,color:#065f46;

    %% Ingestion Section
    subgraph Ingestion Pipeline [1. Ingestion & Embedding Generation]
        A[Candidate Submits PDF Resume] -->|Cloudinary Route| B[Upload to Cloudinary CDN]
        B -->|Get CDN URL| C[Call /api/candidates/parse]
        C -->|Download PDF Buffer| D(Fetch PDF Bytes via Axios)
        D -->|Base64 Inline Data| E[Gemini 3.5 Flash Parser]:::ai
        E -->|Structured Assessment| F[Extract Skills, Summaries, Pros/Cons]
        E -->|Raw Text Transcription| G[Generate resumeText]
        G -->|gemini-embedding-2| H[Generate 768d Vector]:::ai
        F & G & H -->|Save to Document| I[(MongoDB Candidates Collection)]:::database
    end

    %% Retrieval & Semantic Search Section
    subgraph Search Pipeline [2. Retrieval & Semantic Matching]
        J[HR Manager enters Search Query OR matches Job Description] --> K[Generate Query Vector via gemini-embedding-2]:::ai
        K --> L{Is MongoDB Atlas Index active?}
        
        %% Vector Search Route
        L -->|Yes| M[Execute $vectorSearch Pipeline]:::database
        M --> N[Retrieve Ranked Matches with metadata score]
        
        %% Fallback Route
        L -->|No / Local DB| O[Fetch Candidate Vectors for Job]:::database
        O --> P[Calculate Cosine Similarity in JavaScript]
        P --> Q[Sort Candidates Descending]
        
        N & Q --> R[Map Similarity Score to 0-100% Match]
        R --> S[Display Ranked Matches in UI]
    end

    %% Batch Screen Workspace Trigger
    subgraph Batch Process [3. Workspace Queue Manager]
        T[HR clicks 'Auto-Screen Unscreened']:::trigger --> U[Fetch Unscreened Candidates]
        U --> V[Loop Sequentially: 1.5s delay]
        V -->|For each candidate| C
    end

    class C,D,F,G,J,K,P,R,S,U,V process;
```

---

## ⚙️ Core Pipeline Components

### 1. Database Schema (`src/models/Candidate.ts`)
Each candidate record is indexed with two fields dedicated to RAG and semantic search operations:
- `resumeText` (String): A clean text transcription of work experience, education, projects, and skills sections. This is used as the context document.
- `resumeEmbedding` (Number Array): A 768-dimensional float vector representing the semantic meaning of the resume content, plotted by the embedding model.

### 2. PDF Text Extraction & Analysis (`src/lib/gemini.ts`)
The PDF parsing uses Gemini's native multimodal capabilities:
- The system fetches the PDF bytes using a timed `axios` call and converts it to a base64 string.
- This buffer is sent as `inlineData` with `mimeType: "application/pdf"` directly to `gemini-3.5-flash`.
- Gemini returns a structured JSON payload containing matching metrics (match score, skills inventory, pros, cons, and tailored interview questions) along with a complete text transcription under `extractedResumeText`.

### 3. Vector Embeddings (`src/lib/gemini.ts`)
- Text is converted to a vector using the **`gemini-embedding-2`** model.
- The output is a normalized 768-dimensional array which is saved directly to `resumeEmbedding`.

### 4. Hybrid Search & Cosine Fallback (`src/app/api/candidates/match/route.ts`)
To perform semantic search or job description matching:
1. The search query (or job posting guidelines) is embedded into a 768d vector.
2. The endpoint attempts to run a native MongoDB Atlas **`$vectorSearch`** stage using the `vector_index` configuration.
3. If the Atlas Vector index is missing (e.g. during local developer setup or community edition deployment), a **JavaScript-based Cosine Similarity fallback** automatically runs:
   $$\text{Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
   It fetches candidates for the job, runs the calculation, filters out empty vectors, and returns candidate profiles sorted by similarity percentage score.

---

## 🛡️ Queue & Rate Limit Protection (Batch Screening)
To avoid Vercel serverless function timeouts (10-second limits on free accounts) and API rate limits, the UI implements a sequential processing queue:
- It checks for `isAiScreened: false` profiles in the selected job collection.
- It iterates through candidates **one by one**, awaiting each API call sequentially.
- A **1.5-second throttling delay** is injected between requests to respect Gemini API request-per-minute (RPM) limits.
