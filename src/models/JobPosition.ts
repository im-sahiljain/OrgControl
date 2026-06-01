import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJobPosition extends Document {
  orgId: string;
  title: string;
  description: string;
  department?: string;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const JobPositionSchema: Schema = new Schema<IJobPosition>(
  {
    orgId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    department: { type: String, default: "Unassigned" },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure job titles are unique within a single organization
JobPositionSchema.index({ orgId: 1, title: 1 }, { unique: true });

const JobPosition: Model<IJobPosition> =
  mongoose.models.JobPosition || mongoose.model<IJobPosition>("JobPosition", JobPositionSchema);

export default JobPosition;
