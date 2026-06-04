import mongoose, { Schema, Document, Model } from "mongoose";

export type DealStage = "Lead" | "Prospect" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";

export interface ISalesDeal extends Document {
  orgId: mongoose.Types.ObjectId;
  title: string;
  clientName: string;
  amount: number;
  stage: DealStage;
  winProbability: number; // 0 to 100
  expectedCloseDate?: Date;
  assignedTo: string; // Employee ID
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SalesDealSchema: Schema = new Schema<ISalesDeal>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    title: { type: String, required: true },
    clientName: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    stage: {
      type: String,
      enum: ["Lead", "Prospect", "Proposal", "Negotiation", "Closed Won", "Closed Lost"],
      default: "Lead",
    },
    winProbability: { type: Number, default: 10 },
    expectedCloseDate: { type: Date },
    assignedTo: { type: String, required: true, index: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch deals by assigned user and stage
SalesDealSchema.index({ orgId: 1, assignedTo: 1, stage: 1 });

const SalesDeal: Model<ISalesDeal> =
  mongoose.models.SalesDeal || mongoose.model<ISalesDeal>("SalesDeal", SalesDealSchema);

export default SalesDeal;
