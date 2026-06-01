import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDashboardModule extends Document {
  orgId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: {
    name: string;
    type: "text" | "number" | "select";
    options?: string[];
  }[];
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const DashboardModuleSchema: Schema = new Schema<IDashboardModule>(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true, default: "Layout" },
    color: { type: String, required: true, default: "blue" },
    fields: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ["text", "number", "select"], required: true },
        options: { type: [String], default: [] },
      },
    ],
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure module names are unique within a single organization
DashboardModuleSchema.index({ orgId: 1, name: 1 }, { unique: true });

const DashboardModule: Model<IDashboardModule> =
  mongoose.models.DashboardModule || mongoose.model<IDashboardModule>("DashboardModule", DashboardModuleSchema);

export default DashboardModule;
