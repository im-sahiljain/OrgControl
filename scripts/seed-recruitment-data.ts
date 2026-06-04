import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import Organization from "../src/models/Organization";
import JobPosting from "../src/models/JobPosting";
import Candidate from "../src/models/Candidate";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env");
  process.exit(1);
}

async function seedRecruitment() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected successfully.");

    // 1. Find Org Technologies
    const org = await Organization.findOne({ slug: "org-technologies" });
    if (!org) {
      console.error("Organization 'Org Technologies' not found. Please run primary seed first.");
      process.exit(1);
    }
    const orgId = org._id;

    // Clear existing jobs and candidates for a clean slate
    await JobPosting.deleteMany({ orgId });
    await Candidate.deleteMany({ orgId });

    console.log("Creating Job Postings...");
    
    // 2. Create Job Postings
    const frontendJob = await JobPosting.create({
      orgId,
      title: "Senior Frontend Engineer (React/Next)",
      department: "Engineering",
      location: "Remote (India)",
      type: "Full-time",
      description: "We are seeking a Senior Frontend Engineer proficient in React, Next.js, Redux Toolkit, and TypeScript. You will own the design and implementation of responsive client-side pages and real-time state dashboards.",
      requirements: [
        "5+ years of software development experience",
        "Expert knowledge of React, Next.js, and TypeScript",
        "Experience configuring state managers like Redux Toolkit or Recoil",
        "Understanding of Web Vitals optimization (LCP, INP, CLS)"
      ],
      status: "active"
    });

    const backendJob = await JobPosting.create({
      orgId,
      title: "Senior Backend Engineer (Node/Mongo)",
      department: "Engineering",
      location: "Hybrid (Mumbai)",
      type: "Full-time",
      description: "Join our core backend infrastructure team to design scalable REST APIs, secure authentication gates, and optimize Mongoose query indexes. Experience in containerization and caching is a plus.",
      requirements: [
        "5+ years of backend development experience using Node.js",
        "Expert knowledge of Express and MongoDB/Mongoose",
        "Experience writing complex aggregation pipelines and indexing",
        "Familiarity with Docker and Redis caching strategies"
      ],
      status: "active"
    });

    console.log("Creating Candidates & AI Screening Insights...");

    // 3. Create Candidates
    // Candidate 1: Rohan Sharma (Frontend - Applied)
    await Candidate.create({
      orgId,
      jobId: frontendJob._id,
      name: "Rohan Sharma",
      email: "rohan.sharma@gmail.com",
      phone: "+91 99887 76655",
      resumeUrl: "data:application/pdf;base64,JVBERi0xLjQKJcFS...",
      stage: "applied",
      matchScore: 88,
      skills: ["React.js", "TypeScript", "Redux Toolkit", "Next.js", "CSS Modules"],
      summary: "Rohan is an experienced frontend engineer with 6 years of expertise. He demonstrates strong familiarity with Redux Toolkit and modern hooks patterns. Resume shows consistent commits in enterprise panels.",
      pros: [
        "High proficiency in React hooks and client-side performance tuning",
        "Comprehensive TypeScript type architectures, minimizing edge case bugs",
        "Familiarity with Next.js App Router conventions"
      ],
      cons: [
        "Limited exposure to backend database models (MongoDB)",
        "Testing coverage on previous profiles could be higher"
      ],
      interviewQuestions: [
        { question: "Explain how you optimize NextJS LCP when loading dynamic dashboard widgets.", focusArea: "Web Vitals" },
        { question: "What is your approach to structuring nested slices in Redux Toolkit?", focusArea: "State Management" }
      ]
    });

    // Candidate 2: Priya Patel (Frontend - Interviewing)
    await Candidate.create({
      orgId,
      jobId: frontendJob._id,
      name: "Priya Patel",
      email: "priya.patel@outlook.com",
      phone: "+91 98223 34455",
      resumeUrl: "data:application/pdf;base64,JVBERi0xLjQKJcFS...",
      stage: "interviewing",
      matchScore: 92,
      skills: ["React.js", "TypeScript", "Tailwind CSS", "Next.js", "Jest", "Cypress"],
      summary: "Priya has 7 years of engineering experience with a sharp focus on testing and UI design consistency. She has managed frontend sub-teams and driven component-library standardizations.",
      pros: [
        "Excellent unit and end-to-end testing coverage using Jest and Cypress",
        "Stunning layout building capabilities using Tailwind CSS",
        "Strong team collaboration and design-system implementation habits"
      ],
      cons: [
        "Has not worked with large-scale streaming configurations on the edge"
      ],
      interviewQuestions: [
        { question: "Describe a scenario where you had to debug a failing end-to-end test suite in Cypress.", focusArea: "Testing Automation" },
        { question: "How do you maintain a consistent design token system using Tailwind across multiple workspace folders?", focusArea: "CSS Systems" }
      ]
    });

    // Candidate 3: Kunal Sen (Backend - Screened)
    await Candidate.create({
      orgId,
      jobId: backendJob._id,
      name: "Kunal Sen",
      email: "kunal.sen@yahoo.com",
      phone: "+91 91234 56789",
      resumeUrl: "data:application/pdf;base64,JVBERi0xLjQKJcFS...",
      stage: "screened",
      matchScore: 84,
      skills: ["Node.js", "Express.js", "MongoDB", "Mongoose", "Docker", "Git"],
      summary: "Kunal is a backend-focused engineer with 5 years of experience. He is skilled in designing Mongoose schemas and writing REST endpoints. He displays consistent code hygiene.",
      pros: [
        "Strong query optimization and schema indexing practices",
        "Experienced in configuring JWT auth routes and token gates",
        "Clean folder structures in backend microservices"
      ],
      cons: [
        "No caching layer experience (Redis)",
        "Minimal experience with frontend state libraries"
      ],
      interviewQuestions: [
        { question: "How do you decide between a single compound index and multiple key indexes in MongoDB?", focusArea: "Query Performance" },
        { question: "Describe how you secure REST API endpoints from potential SQL/NoSQL injection vulnerabilities.", focusArea: "API Security" }
      ]
    });

    console.log("Recruitment data seeded successfully!");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

seedRecruitment();
