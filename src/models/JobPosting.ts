import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJobPosting extends Document {
  orgId: mongoose.Types.ObjectId;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  description: string;
  requirements: string[];
  status: "active" | "inactive" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const JobPostingSchema: Schema = new Schema<IJobPosting>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
    },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const JobPosting: Model<IJobPosting> =
  mongoose.models.JobPosting || mongoose.model<IJobPosting>("JobPosting", JobPostingSchema);

export default JobPosting;
