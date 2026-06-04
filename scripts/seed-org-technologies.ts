import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

// ─── Load environment variables ────────────────────────────────────────────
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ─── Import models ─────────────────────────────────────────────────────────
import Organization from "../src/models/Organization";
import Employee from "../src/models/Employee";
import Department from "../src/models/Department";
import PlatformOwner from "../src/models/PlatformOwner";
import JobPosition from "../src/models/JobPosition";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("MONGODB_URI is not set. Check .env.local or .env");
  process.exit(1);
}

// ─── Employee definitions ──────────────────────────────────────────────────
// Each entry: [name, email, password, position, age, salary]
type EmpDef = [string, string, string, string, number, number];

const HR_EMPLOYEES: EmpDef[] = [
  ["Sahil Jain",     "sahil@orgtech.in",     "pass123", "CHRO (Head of HR)",         28, 180000],
  ["Meera Kapoor",   "meera@orgtech.in",     "pass123", "HR Manager - Recruitment",  32, 120000],
  ["Ravi Tiwari",    "ravi@orgtech.in",      "pass123", "HR Coordinator",            26, 60000],
  ["Sneha Desai",    "sneha@orgtech.in",     "pass123", "HR Associate",              24, 50000],
];

const ENG_EMPLOYEES: EmpDef[] = [
  ["Arjun Mehta",    "arjun@orgtech.in",     "pass123", "VP of Engineering",         35, 250000],
  ["Priya Nair",     "priya@orgtech.in",     "pass123", "Frontend Lead",             30, 160000],
  ["Karan Singh",    "karan@orgtech.in",     "pass123", "Backend Lead",              31, 160000],
  ["Ankit Gupta",    "ankit@orgtech.in",     "pass123", "Senior Frontend Dev",       28, 120000],
  ["Divya Sharma",   "divya@orgtech.in",     "pass123", "Frontend Dev",              25, 90000],
  ["Rohit Verma",    "rohit@orgtech.in",     "pass123", "Senior Backend Dev",        29, 130000],
  ["Pooja Yadav",    "pooja@orgtech.in",     "pass123", "Backend Dev",               26, 95000],
];

const SALES_EMPLOYEES: EmpDef[] = [
  ["Vikram Malhotra","vikram@orgtech.in",    "pass123", "VP of Sales",               38, 220000],
  ["Neha Reddy",     "neha.r@orgtech.in",    "pass123", "Enterprise Sales Manager",  33, 150000],
  ["Kabir Sen",      "kabir@orgtech.in",     "pass123", "SMB Sales Manager",         30, 140000],
  ["Aisha Patel",    "aisha@orgtech.in",     "pass123", "Account Executive",         27, 100000],
  ["Siddharth Rao",  "siddharth@orgtech.in", "pass123", "Sales Associate",           25, 80000],
  ["Tanya Bose",     "tanya@orgtech.in",     "pass123", "Inside Sales Rep",          24, 70000],
];

const FINANCE_EMPLOYEES: EmpDef[] = [
  ["Nisha Iyer",     "nisha@orgtech.in",     "pass123", "CFO",                       40, 280000],
  ["Amit Joshi",     "amit@orgtech.in",      "pass123", "Finance Manager",           34, 140000],
  ["Kavya Menon",    "kavya@orgtech.in",     "pass123", "Financial Analyst",         27, 90000],
  ["Deepak Kumar",   "deepak@orgtech.in",    "pass123", "Accounts Executive",        26, 75000],
];

// ─── Helper to bulk-create employees ───────────────────────────────────────
async function createEmployees(
  defs: EmpDef[],
  orgId: mongoose.Types.ObjectId,
  departmentName: string
): Promise<mongoose.Types.ObjectId[]> {
  const ids: mongoose.Types.ObjectId[] = [];
  for (const [empName, email, password, empPosition, empAge, salary] of defs) {
    const emp = await Employee.create({
      orgId,
      empName,
      email,
      password,
      empPosition,
      empAge,
      salary,
      department: departmentName,
      status: "active",
      clockedIn: false,
      leaveBalances: { casual: 12, sick: 10, earned: 15 },
    });
    ids.push(emp._id as mongoose.Types.ObjectId);
    console.log(`  ✓ Employee: ${empName} (${email})`);
  }
  return ids;
}

// ─── Main seed function ────────────────────────────────────────────────────
async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI!);
  console.log("Connected.\n");

  // ── 1. Platform Owner ──────────────────────────────────────────────────
  console.log("━━━ Creating Platform Owner ━━━");
  const existingOwner = await PlatformOwner.findOne({ email: "admin@saasmaker.in" });
  if (!existingOwner) {
    await PlatformOwner.create({
      name: "Platform Owner",
      email: "admin@saasmaker.in",
      password: "admin123",
      role: "platform_admin",
    });
    console.log("  ✓ Platform Owner: admin@saasmaker.in / admin123");
  } else {
    console.log("  ✓ Platform Owner already exists.");
  }

  // ── 2. Organization ────────────────────────────────────────────────────
  console.log("\n━━━ Creating Organization ━━━");
  const org = await Organization.create({
    name: "Org Technologies",
    slug: "org-technologies",
    plan: "Enterprise",
    adminEmail: "sahil@orgtech.in",
    status: "active",
  });
  const orgId = org._id as mongoose.Types.ObjectId;
  console.log(`  ✓ Organization: "Org Technologies" (_id: ${orgId})`);

  // ── 3. Employees ───────────────────────────────────────────────────────
  console.log("\n━━━ Creating HR Employees ━━━");
  const hrIds = await createEmployees(HR_EMPLOYEES, orgId, "Human Resources");

  console.log("\n━━━ Creating Engineering Employees ━━━");
  const engIds = await createEmployees(ENG_EMPLOYEES, orgId, "Engineering");

  console.log("\n━━━ Creating Sales Employees ━━━");
  const salesIds = await createEmployees(SALES_EMPLOYEES, orgId, "Sales");

  console.log("\n━━━ Creating Finance Employees ━━━");
  const finIds = await createEmployees(FINANCE_EMPLOYEES, orgId, "Finance & Accounting");

  // ── 4. Departments with hierarchy ──────────────────────────────────────
  console.log("\n━━━ Creating Departments with Hierarchy ━━━");

  // HR: Sahil = head, Meera = manager of [Ravi, Sneha]
  await Department.create({
    orgId,
    slug: "hr",
    name: "Human Resources",
    description: "People management — hiring, onboarding, employee lifecycle, compliance, and culture.",
    isPredefined: true,
    headIds: [hrIds[0].toString()],
    managers: [
      {
        managerId: hrIds[1].toString(),
        memberIds: [hrIds[2].toString(), hrIds[3].toString()],
      },
    ],
    budget: { annual: 500000, currency: "INR" },
    status: "active",
  });
  console.log("  ✓ Department: Human Resources (Head: Sahil, Manager: Meera → [Ravi, Sneha])");

  // Engineering: Arjun = head, Priya = manager of [Ankit, Divya], Karan = manager of [Rohit, Pooja]
  await Department.create({
    orgId,
    slug: "engineering",
    name: "Engineering",
    description: "Product building — software development, infrastructure, deployments, and technical innovation.",
    isPredefined: true,
    headIds: [engIds[0].toString()],
    managers: [
      {
        managerId: engIds[1].toString(),
        memberIds: [engIds[3].toString(), engIds[4].toString()],
      },
      {
        managerId: engIds[2].toString(),
        memberIds: [engIds[5].toString(), engIds[6].toString()],
      },
    ],
    budget: { annual: 2000000, currency: "INR" },
    status: "active",
  });
  console.log("  ✓ Department: Engineering (Head: Arjun, Managers: Priya → [Ankit, Divya], Karan → [Rohit, Pooja])");

  // Sales: Vikram = head, Neha.R = manager of [Aisha, Siddharth], Kabir = manager of [Tanya]
  await Department.create({
    orgId,
    slug: "sales",
    name: "Sales",
    description: "Revenue generation — prospecting, deal management, client relationships, and revenue forecasting.",
    isPredefined: true,
    headIds: [salesIds[0].toString()],
    managers: [
      {
        managerId: salesIds[1].toString(),
        memberIds: [salesIds[3].toString(), salesIds[4].toString()],
      },
      {
        managerId: salesIds[2].toString(),
        memberIds: [salesIds[5].toString()],
      },
    ],
    budget: { annual: 1500000, currency: "INR" },
    status: "active",
  });
  console.log("  ✓ Department: Sales (Head: Vikram, Managers: Neha.R → [Aisha, Siddharth], Kabir → [Tanya])");

  // Finance: Nisha = head, Amit = manager of [Kavya, Deepak]
  await Department.create({
    orgId,
    slug: "finance",
    name: "Finance & Accounting",
    description: "Financial health — accounting, budgeting, treasury, tax compliance, and financial reporting.",
    isPredefined: true,
    headIds: [finIds[0].toString()],
    managers: [
      {
        managerId: finIds[1].toString(),
        memberIds: [finIds[2].toString(), finIds[3].toString()],
      },
    ],
    budget: { annual: 800000, currency: "INR" },
    status: "active",
  });
  console.log("  ✓ Department: Finance & Accounting (Head: Nisha, Manager: Amit → [Kavya, Deepak])");

  // ── 5. Job Positions ───────────────────────────────────────────────────
  console.log("\n━━━ Creating Job Positions ━━━");
  const allPositions = new Set([
    ...HR_EMPLOYEES.map((e) => e[3]),
    ...ENG_EMPLOYEES.map((e) => e[3]),
    ...SALES_EMPLOYEES.map((e) => e[3]),
    ...FINANCE_EMPLOYEES.map((e) => e[3]),
  ]);
  for (const title of allPositions) {
    await JobPosition.create({
      orgId,
      title,
      description: "",
      department: "Unassigned",
      status: "active",
    });
    console.log(`  ✓ Position: ${title}`);
  }

  // ── Done ───────────────────────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Seed complete!");
  console.log(`   Organization: Org Technologies (${orgId})`);
  console.log(`   Employees: ${HR_EMPLOYEES.length + ENG_EMPLOYEES.length + SALES_EMPLOYEES.length + FINANCE_EMPLOYEES.length}`);
  console.log(`   Departments: 4`);
  console.log(`   Positions: ${allPositions.size}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
