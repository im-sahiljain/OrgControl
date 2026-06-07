# AI-Powered ATS & Recruitment Workspace 🏢

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![Redux Toolkit](https://img.shields.io/badge/Redux-Toolkit-purple)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-red)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)
![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-orange)

An intelligent Applicant Tracking System (ATS) and Recruitment Workspace built to eliminate manual resume screening. By combining Generative AI with advanced Vector Search, this platform reads, understands, and mathematically matches candidates to job requirements.

## ✨ Key Features

- **Automated Resume Screening (Gemini Flash):** Uploaded resumes are parsed to extract structured insights (skills, pros, cons) and automatically graded with a baseline Match Score against the job description.
- **Semantic RAG Candidate Search:** Utilizes **Retrieval-Augmented Generation (RAG)**. Resumes are converted into 3,072-dimensional vectors using `gemini-embedding-2`. Recruiters can perform semantic queries (e.g., "state management expert"), and MongoDB Vector Search instantly retrieves the closest matches—even without exact keyword overlap.
- **Interactive Kanban Pipeline:** A drag-and-drop dashboard to seamlessly move candidates through stages (Applied, Screened, Interviewing, Offered, Rejected).
- **High-Performance Frontend Architecture:** Leverages **React Query** for intelligent client-side caching (instant RAG searches when switching jobs) and **Redux Toolkit** for complex synchronous UI state, preventing unnecessary re-renders.
- **Sequential Batch Processing:** Features a background asynchronous queueing system for AI auto-screening, avoiding UI freezing and protecting against AI API rate limits.

## 🚀 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **State Management:** Redux Toolkit (Client State) + TanStack Query (Server State)
- **Database:** MongoDB Atlas (Mongoose + HNSW Vector Indexing)
- **AI Integration:** Google GenAI SDK (Gemini Flash, Gemini Embeddings)
- **Styling & UI:** Tailwind CSS, Shadcn UI

## 💻 Getting Started

First, clone the repository and install dependencies:

```bash
git clone https://github.com/im-sahiljain/OrgControl.git
cd OrgControl
npm install
```

Ensure your environment variables are configured in `.env` (refer to `.env.sample`). Crucially, you must provide your MongoDB Atlas URI and a Google Gemini API Key.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
