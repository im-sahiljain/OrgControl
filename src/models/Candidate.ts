import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICandidate extends Document {
  orgId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string;
  stage: "applied" | "screened" | "interviewing" | "offered" | "rejected";
  isAiScreened: boolean;
  matchScore: number;
  skills: string[];
  summary: string;
  pros: string[];
  cons: string[];
  interviewQuestions: { question: string; focusArea: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema: Schema = new Schema<ICandidate>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "JobPosting", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    resumeUrl: { type: String, required: true },
    stage: {
      type: String,
      enum: ["applied", "screened", "interviewing", "offered", "rejected"],
      default: "applied",
    },
    isAiScreened: { type: Boolean, default: false },
    matchScore: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    summary: { type: String, default: "" },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    interviewQuestions: [
      {
        question: { type: String, required: true },
        focusArea: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Candidate: Model<ICandidate> =
  mongoose.models.Candidate || mongoose.model<ICandidate>("Candidate", CandidateSchema);

export default Candidate;
