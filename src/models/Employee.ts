import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmployee extends Document {
  orgId: mongoose.Types.ObjectId;
  empName: string;
  empAge: number;
  empPosition: string;
  email: string;
  password?: string;
  profilePhoto?: string;
  department?: string;
  status: "onboarding" | "probation" | "active" | "on_notice" | "resigned" | "terminated";
  salary: number;
  clockedIn: boolean;
  clockInTime?: Date;
  leaveBalances: {
    casual: number;
    sick: number;
    earned: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema<IEmployee>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    empName: { type: String, required: true },
    empAge: { type: Number, required: true },
    empPosition: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: false },
    profilePhoto: { type: String, default: "" },
    department: { type: String, default: "Engineering" },
    status: {
      type: String,
      enum: ["onboarding", "probation", "active", "on_notice", "resigned", "terminated"],
      default: "active",
    },
    salary: { type: Number, default: 80000 }, // Monthly salary for calculations
    clockedIn: { type: Boolean, default: false },
    clockInTime: { type: Date },
    leaveBalances: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      earned: { type: Number, default: 15 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to speed up searches by organization and ensure email isolation per tenant
EmployeeSchema.index({ orgId: 1, email: 1 }, { unique: true });

const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;
