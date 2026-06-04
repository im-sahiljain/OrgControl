import mongoose from "mongoose";

export interface IOrganization extends mongoose.Document {
  name: string;
  slug: string;
  plan: "Starter" | "Professional" | "Enterprise";
  adminEmail: string;
  status: "active" | "suspended" | "trial";
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    plan: {
      type: String,
      enum: ["Starter", "Professional", "Enterprise"],
      default: "Starter",
    },
    adminEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "suspended", "trial"],
      default: "trial",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
