import mongoose, { Schema, Document, Model } from "mongoose";

export interface IModuleEntry extends Document {
  orgId: mongoose.Types.ObjectId;
  moduleId: string;
  departmentId: string;
  submittedBy: {
    id: string;
    name: string;
  };
  data: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ModuleEntrySchema: Schema = new Schema<IModuleEntry>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    moduleId: { type: String, required: true, index: true },
    departmentId: { type: String, required: true, index: true },
    submittedBy: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
    data: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  {
    timestamps: true,
  }
);

const ModuleEntry: Model<IModuleEntry> =
  mongoose.models.ModuleEntry || mongoose.model<IModuleEntry>("ModuleEntry", ModuleEntrySchema);

export default ModuleEntry;
