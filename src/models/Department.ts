import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartment extends Document {
  orgId: mongoose.Types.ObjectId;
  slug?: string;
  name: string;
  description?: string;
  isPredefined?: boolean;
  headIds: string[]; // Supports multiple leadership heads in each department
  parentDepartmentId?: Schema.Types.ObjectId | null;
  budget: {
    annual: number;
    currency: string;
  };
  managers?: {
    managerId: string;
    memberIds: string[];
  }[];
  enabledWidgets?: string[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema<IDepartment>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    slug: { type: String, index: true },
    name: { type: String, required: true },
    description: { type: String },
    isPredefined: { type: Boolean, default: true },
    headIds: { type: [String], default: [] }, // Array of leader employee IDs
    parentDepartmentId: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    budget: {
      annual: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },
    managers: {
      type: [{
        managerId: { type: String, required: true },
        memberIds: { type: [String], default: [] },
      }],
      default: [],
    },
    enabledWidgets: { type: [String], default: [] },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure department names are unique within a single organization
DepartmentSchema.index({ orgId: 1, name: 1 }, { unique: true });

const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);

export default Department;
