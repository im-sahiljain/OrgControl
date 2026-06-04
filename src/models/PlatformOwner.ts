import mongoose, { Document, Schema } from "mongoose";

export interface IPlatformOwner extends Document {
  name: string;
  email: string;
  password?: string;
  role: "platform_admin";
}

const PlatformOwnerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "platform_admin" },
  },
  { timestamps: true }
);

export default mongoose.models.PlatformOwner ||
  mongoose.model<IPlatformOwner>("PlatformOwner", PlatformOwnerSchema);
