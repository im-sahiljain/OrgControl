// ─── Department Feature Registry ───────────────────────────────────────────
// Single source of truth for all predefined departments and their features.
// This replaces the old "Manage Modules" approach where department managers
// manually created their own modules.

export type AccessLevel = "full" | "operational" | "view_only" | "none";

export interface DepartmentFeatureAccess {
  department_head: AccessLevel;
  team_manager: AccessLevel;
  team_member: AccessLevel;
}

export interface DepartmentFeature {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: "dashboard_widget" | "page" | "workflow";
  access: DepartmentFeatureAccess;
  /** true = functional page exists; false = falls back to ComingSoon and is hidden from UI */
  implemented?: boolean;
}

export interface PredefinedDepartment {
  slug: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color key
}

// ─── 12 Predefined Departments ─────────────────────────────────────────────

export const PREDEFINED_DEPARTMENTS: PredefinedDepartment[] = [
  {
    slug: "hr",
    name: "Human Resources",
    description: "People management — hiring, onboarding, employee lifecycle, compliance, and culture.",
    icon: "Users",
    color: "rose",
  },
  {
    slug: "finance",
    name: "Finance & Accounting",
    description: "Financial health — accounting, budgeting, treasury, tax compliance, and financial reporting.",
    icon: "Coins",
    color: "violet",
  },
  {
    slug: "sales",
    name: "Sales",
    description: "Revenue generation — prospecting, deal management, client relationships, and revenue forecasting.",
    icon: "TrendingUp",
    color: "emerald",
  },
  {
    slug: "engineering",
    name: "Engineering",
    description: "Product building — software development, infrastructure, deployments, and technical innovation.",
    icon: "Code",
    color: "blue",
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "Brand awareness — campaigns, content, demand generation, and market positioning.",
    icon: "Megaphone",
    color: "amber",
  },
  {
    slug: "operations",
    name: "Operations",
    description: "Operational efficiency — process optimization, supply chain, facilities, and day-to-day operations.",
    icon: "Settings",
    color: "sky",
  },
  {
    slug: "legal",
    name: "Legal & Compliance",
    description: "Legal protection — contracts, regulatory compliance, intellectual property, and risk management.",
    icon: "Scale",
    color: "violet",
  },
  {
    slug: "support",
    name: "Customer Support",
    description: "Customer satisfaction — issue resolution, relationship management, retention, and customer health.",
    icon: "Headphones",
    color: "emerald",
  },
  {
    slug: "product",
    name: "Product Management",
    description: "Product strategy — roadmap, feature prioritization, user research, and product-market fit.",
    icon: "Package",
    color: "blue",
  },
  {
    slug: "procurement",
    name: "Procurement & Purchasing",
    description: "Sourcing — vendor selection, purchase orders, cost optimization, and supply chain management.",
    icon: "ShoppingCart",
    color: "amber",
  },
  {
    slug: "it",
    name: "IT & Infrastructure",
    description: "Technology backbone — hardware, software, network, security, and employee IT services.",
    icon: "Server",
    color: "sky",
  },
  {
    slug: "admin",
    name: "General Administration",
    description: "Office administration — facilities, front desk, travel, and general organizational support.",
    icon: "Building",
    color: "rose",
  },
];

// ─── Department Features (by slug) ─────────────────────────────────────────

export const DEPARTMENT_FEATURES: Record<string, DepartmentFeature[]> = {
  hr: [
    {
      id: "hr_recruitment",
      name: "Recruitment & Hiring Pipeline",
      description: "Job requisitions, applicant tracking, interview scheduling, offer management",
      icon: "UserPlus",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
      implemented: true,
    },
    {
      id: "hr_onboarding",
      name: "Employee Onboarding",
      description: "Onboarding checklists, document collection, welcome kits, first-week task flows",
      icon: "ClipboardList",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "hr_directory",
      name: "Employee Directory & Profiles",
      description: "Centralized employee records — personal info, emergency contacts, employment history",
      icon: "Contact",
      category: "page",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
      implemented: true,
    },
    {
      id: "hr_leave",
      name: "Leave Management",
      description: "Leave policies, leave balances, approval workflows, leave calendar",
      icon: "CalendarOff",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "hr_attendance",
      name: "Attendance & Time Tracking",
      description: "Clock-in/out, timesheet management, overtime tracking",
      icon: "Clock",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "hr_milestones",
      name: "Employee Milestones & Celebrations",
      description: "Birthdays, work anniversaries, tenure milestones, automatic reminders",
      icon: "Cake",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "hr_performance",
      name: "Performance Reviews",
      description: "Review cycles (quarterly/annual), goal-setting, 360° feedback",
      icon: "Award",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "hr_training",
      name: "Training & Development",
      description: "Learning programs, certification tracking, skill gap analysis, course assignments",
      icon: "GraduationCap",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "hr_engagement",
      name: "Employee Engagement & Surveys",
      description: "Pulse surveys, eNPS scores, feedback collection, sentiment analysis",
      icon: "Heart",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "view_only", team_member: "view_only" },
    },
    {
      id: "hr_grievance",
      name: "Grievance & Complaints",
      description: "Formal grievance filing, investigation tracking, resolution workflows",
      icon: "AlertTriangle",
      category: "workflow",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
    {
      id: "hr_orgchart",
      name: "Org Chart & Hierarchy",
      description: "Visual org chart, reporting lines, department structures, span of control",
      icon: "Network",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "hr_offboarding",
      name: "Offboarding & Exit Management",
      description: "Exit checklists, exit interviews, asset recovery, knowledge transfer",
      icon: "LogOut",
      category: "workflow",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
  ],

  finance: [
    {
      id: "fin_payroll",
      name: "Payroll Processing",
      description: "Salary computation, tax deductions, statutory compliance, payslip generation",
      icon: "Banknote",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "fin_budget",
      name: "Budget Management",
      description: "Department-wise budget allocation, burn rate tracking, variance analysis",
      icon: "PieChart",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "fin_expense",
      name: "Expense Management",
      description: "Expense claims, receipt upload, approval workflows, reimbursement tracking",
      icon: "Receipt",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "fin_treasury",
      name: "Treasury & Cash Flow",
      description: "Bank account monitoring, cash flow forecasting, fund allocation",
      icon: "Wallet",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "view_only", team_member: "none" },
    },
    {
      id: "fin_ap",
      name: "Accounts Payable",
      description: "Vendor invoice processing, payment scheduling, aging reports",
      icon: "FileOutput",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "fin_ar",
      name: "Accounts Receivable",
      description: "Client invoicing, payment tracking, collection follow-ups, aging reports",
      icon: "FileInput",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "fin_ledger",
      name: "General Ledger",
      description: "Chart of accounts, journal entries, trial balance, financial statements",
      icon: "BookOpen",
      category: "page",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "fin_tax",
      name: "Tax Compliance",
      description: "GST/VAT filing, TDS computation, tax calendar, audit trail",
      icon: "Calculator",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "fin_reporting",
      name: "Financial Reporting",
      description: "P&L statements, balance sheets, MIS reports, board-ready dashboards",
      icon: "BarChart3",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
    {
      id: "fin_audit",
      name: "Audit Management",
      description: "Internal/external audit scheduling, finding tracking, compliance checklists",
      icon: "ShieldCheck",
      category: "workflow",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
  ],

  sales: [
    {
      id: "sales_pipeline",
      name: "Sales Pipeline / CRM",
      description: "Lead → Prospect → Proposal → Negotiation → Closed Won/Lost tracking",
      icon: "Filter",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
      implemented: true,
    },
    {
      id: "sales_quota",
      name: "Revenue Quota Tracking",
      description: "Individual & team quota targets, achievement percentages, forecasting",
      icon: "Target",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "sales_deals",
      name: "Deal Management",
      description: "Deal stages, deal values, win probability, expected close dates",
      icon: "Handshake",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "sales_leaderboard",
      name: "Sales Leaderboard",
      description: "Top performers by revenue, deals closed, conversion rate",
      icon: "Trophy",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "sales_meetings",
      name: "Client Meeting Scheduler",
      description: "Meeting scheduling, notes, follow-up tasks, calendar integration",
      icon: "CalendarCheck",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "sales_proposals",
      name: "Proposal & Quote Generator",
      description: "Template-based proposals, pricing configurator, digital signatures",
      icon: "FileText",
      category: "workflow",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "sales_commission",
      name: "Commission Calculator",
      description: "Commission tiers, slab-based payouts, commission statements",
      icon: "DollarSign",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "view_only", team_member: "view_only" },
    },
    {
      id: "sales_territory",
      name: "Territory Management",
      description: "Geographic/account-based territory assignment, coverage analysis",
      icon: "MapPin",
      category: "page",
      access: { department_head: "full", team_manager: "view_only", team_member: "view_only" },
    },
    {
      id: "sales_forecast",
      name: "Sales Forecasting",
      description: "Revenue projections, weighted pipeline, trend analysis",
      icon: "LineChart",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
    {
      id: "sales_accounts",
      name: "Customer Account Management",
      description: "Client profiles, contact history, renewal tracking, upsell opportunities",
      icon: "Building2",
      category: "page",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
  ],

  engineering: [
    {
      id: "eng_sprint",
      name: "Sprint / Project Tracker",
      description: "Sprint planning, backlog management, story points, velocity tracking",
      icon: "Kanban",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "eng_health",
      name: "System Health Monitor",
      description: "Service uptime, API latency, error rates, infrastructure health",
      icon: "Activity",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "eng_oncall",
      name: "Incident & On-Call Management",
      description: "PagerDuty roster, incident severity tracking, postmortem documentation",
      icon: "PhoneCall",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "eng_cicd",
      name: "CI/CD Pipeline Dashboard",
      description: "Build status, deployment frequency, rollback tracking, release notes",
      icon: "Rocket",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "eng_codereview",
      name: "Code Review Tracker",
      description: "PR queue, review turnaround time, approval status",
      icon: "GitPullRequest",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "eng_techdebt",
      name: "Technical Debt Register",
      description: "Debt items, priority scoring, remediation timelines",
      icon: "AlertCircle",
      category: "page",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "eng_bugs",
      name: "Bug Tracker",
      description: "Bug reports, severity classification, assignment, resolution tracking",
      icon: "Bug",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "eng_dora",
      name: "Developer Productivity Metrics",
      description: "DORA metrics — deployment frequency, lead time, MTTR, change failure rate",
      icon: "Gauge",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
    {
      id: "eng_wiki",
      name: "Knowledge Base / Wiki",
      description: "Internal documentation, runbooks, API docs, onboarding guides",
      icon: "BookOpenCheck",
      category: "page",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
  ],

  marketing: [
    {
      id: "mkt_campaigns",
      name: "Campaign Manager",
      description: "Campaign planning, scheduling, budget allocation, A/B testing",
      icon: "Megaphone",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "mkt_leads",
      name: "Lead Generation Tracker",
      description: "MQL/SQL tracking, lead source attribution, conversion funnels",
      icon: "UserPlus",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "mkt_content",
      name: "Content Calendar",
      description: "Blog posts, social media, email campaigns, editorial schedule",
      icon: "Calendar",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "mkt_social",
      name: "Social Media Dashboard",
      description: "Platform-wise metrics, engagement rates, posting schedule",
      icon: "Share2",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "mkt_seo",
      name: "SEO & Analytics",
      description: "Keyword rankings, organic traffic, page performance, competitor analysis",
      icon: "Search",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "mkt_email",
      name: "Email Marketing",
      description: "Email campaigns, open/click rates, list segmentation, automation flows",
      icon: "Mail",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "mkt_events",
      name: "Event Management",
      description: "Webinars, conferences, trade shows — planning, registration, follow-up",
      icon: "CalendarHeart",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "mkt_budget",
      name: "Marketing Budget Tracker",
      description: "Channel-wise spend, ROI analysis, CPL/CPA calculations",
      icon: "PieChart",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
    {
      id: "mkt_competitive",
      name: "Competitive Intelligence",
      description: "Competitor tracking, market positioning, SWOT analysis",
      icon: "Eye",
      category: "page",
      access: { department_head: "full", team_manager: "view_only", team_member: "none" },
    },
  ],

  operations: [
    {
      id: "ops_projects",
      name: "Project / Task Management",
      description: "Cross-functional project tracking, milestones, dependencies, Gantt charts",
      icon: "FolderKanban",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "ops_inventory",
      name: "Inventory Management",
      description: "Stock levels, reorder points, warehouse tracking, SKU management",
      icon: "Boxes",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "ops_facility",
      name: "Facility Management",
      description: "Office space, meeting room booking, maintenance requests, visitor management",
      icon: "Building",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "ops_fleet",
      name: "Fleet / Logistics",
      description: "Vehicle tracking, delivery scheduling, route optimization",
      icon: "Truck",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "ops_kpi",
      name: "Operational KPI Dashboard",
      description: "SLA adherence, throughput, cycle time, utilization rates",
      icon: "Gauge",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
    {
      id: "ops_safety",
      name: "Health, Safety & Environment",
      description: "Safety incidents, compliance checklists, training records",
      icon: "ShieldAlert",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "ops_vendor",
      name: "Vendor & Supplier Management",
      description: "Supplier onboarding, performance scoring, contract renewals",
      icon: "Handshake",
      category: "page",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "ops_process",
      name: "Process Documentation",
      description: "SOPs, process flowcharts, workflow templates, version control",
      icon: "FileText",
      category: "page",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
  ],

  legal: [
    {
      id: "legal_contracts",
      name: "Contract Lifecycle Management",
      description: "Contract drafting, negotiation, approval, execution, renewal tracking",
      icon: "FileSignature",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "legal_compliance",
      name: "Compliance Tracker",
      description: "Regulatory requirements, compliance checklists, audit readiness",
      icon: "ShieldCheck",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "legal_cases",
      name: "Legal Case Management",
      description: "Active litigation, dispute tracking, legal counsel assignments",
      icon: "Gavel",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "legal_privacy",
      name: "Data Privacy & GDPR",
      description: "Data processing records, DSAR tracking, consent management",
      icon: "Lock",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "legal_risk",
      name: "Risk Register",
      description: "Risk identification, scoring, mitigation plans, risk heat maps",
      icon: "AlertOctagon",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
    {
      id: "legal_filings",
      name: "Regulatory Filing Calendar",
      description: "Filing deadlines, submission tracking, compliance calendar",
      icon: "CalendarClock",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "legal_ip",
      name: "Intellectual Property Register",
      description: "Patents, trademarks, copyrights, filing dates, renewal schedules",
      icon: "Lightbulb",
      category: "page",
      access: { department_head: "full", team_manager: "view_only", team_member: "none" },
    },
  ],

  support: [
    {
      id: "sup_tickets",
      name: "Ticket Management System",
      description: "Support ticket creation, assignment, SLA tracking, escalation rules",
      icon: "Ticket",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "sup_chat",
      name: "Live Chat / Communication Hub",
      description: "Real-time chat, canned responses, chatbot integration",
      icon: "MessageCircle",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "operational" },
    },
    {
      id: "sup_health",
      name: "Customer Health Score",
      description: "Engagement metrics, usage patterns, churn risk scoring",
      icon: "HeartPulse",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "sup_nps",
      name: "CSAT & NPS Tracker",
      description: "Post-interaction surveys, NPS campaigns, satisfaction trends",
      icon: "ThumbsUp",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "view_only", team_member: "view_only" },
    },
    {
      id: "sup_escalation",
      name: "Escalation Management",
      description: "Escalation paths, SLA breach alerts, priority handling",
      icon: "AlertTriangle",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "sup_sla",
      name: "SLA Dashboard",
      description: "SLA compliance rates, response/resolution times, breach reports",
      icon: "Timer",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
    {
      id: "sup_renewal",
      name: "Renewal & Churn Management",
      description: "Renewal pipeline, churn analysis, retention playbooks",
      icon: "RefreshCcw",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
  ],

  product: [
    {
      id: "prod_roadmap",
      name: "Product Roadmap",
      description: "Visual roadmap (Now/Next/Later), timeline view, release planning",
      icon: "Map",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "prod_backlog",
      name: "Feature Backlog & Prioritization",
      description: "Feature requests, scoring frameworks (RICE/ICE), voting, impact analysis",
      icon: "ListOrdered",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "prod_releases",
      name: "Release Management",
      description: "Release notes, version tracking, feature flags, rollout schedules",
      icon: "Tag",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "prod_analytics",
      name: "Product Analytics Dashboard",
      description: "Feature adoption, usage funnels, retention cohorts, DAU/MAU",
      icon: "BarChart3",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "prod_experiments",
      name: "A/B Experiment Tracker",
      description: "Experiment setup, hypothesis tracking, results analysis",
      icon: "FlaskConical",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "prod_feedback",
      name: "Feedback & Feature Requests",
      description: "Customer/internal feature requests, voting, status updates",
      icon: "MessageSquarePlus",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "prod_okrs",
      name: "Product OKRs",
      description: "Product goals, key results tracking, quarterly alignment",
      icon: "Crosshair",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
  ],

  procurement: [
    {
      id: "proc_requests",
      name: "Purchase Request Management",
      description: "Request creation, multi-level approval workflow, budget validation",
      icon: "FileCheck",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "proc_orders",
      name: "Purchase Order System",
      description: "PO creation, vendor assignment, delivery tracking, GRN matching",
      icon: "ShoppingBag",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "proc_rfq",
      name: "RFQ / RFP Management",
      description: "Quote requests, bid comparison, vendor negotiations",
      icon: "FileQuestion",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "proc_spend",
      name: "Spend Analytics",
      description: "Category-wise spend, savings tracking, maverick spend identification",
      icon: "BarChart3",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
    {
      id: "proc_budget",
      name: "Procurement Budget Tracker",
      description: "Budget vs actuals, commitment tracking, forecast variance",
      icon: "Wallet",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "proc_vendor",
      name: "Vendor Management",
      description: "Vendor registration, qualification, performance scorecards",
      icon: "Users",
      category: "page",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
  ],

  it: [
    {
      id: "it_helpdesk",
      name: "IT Helpdesk / Ticketing",
      description: "Service requests, incident management, SLA tracking, knowledge base",
      icon: "LifeBuoy",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "it_assets",
      name: "IT Asset Inventory",
      description: "Laptops, monitors, licenses, assignment tracking, depreciation",
      icon: "Monitor",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "it_licenses",
      name: "Software License Management",
      description: "License tracking, renewal alerts, compliance audits, seat optimization",
      icon: "Key",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "it_access",
      name: "Access & Identity Management",
      description: "User provisioning, role-based access, SSO config, deprovisioning",
      icon: "Fingerprint",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "it_infra",
      name: "Network & Infrastructure Monitoring",
      description: "Server health, bandwidth usage, uptime monitoring, alert escalation",
      icon: "Server",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "it_security",
      name: "Cybersecurity Dashboard",
      description: "Threat alerts, vulnerability scans, phishing reports, patch status",
      icon: "Shield",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "none" },
    },
    {
      id: "it_provision",
      name: "Employee IT Onboarding / Offboarding",
      description: "Device provisioning, account setup, return tracking",
      icon: "Laptop",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
  ],

  admin: [
    {
      id: "adm_visitors",
      name: "Visitor Management",
      description: "Visitor pre-registration, check-in/out, badge printing, host notifications",
      icon: "UserCheck",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "adm_rooms",
      name: "Meeting Room Booking",
      description: "Room availability, calendar integration, amenity requests, recurring bookings",
      icon: "DoorOpen",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "adm_travel",
      name: "Travel & Expense Management",
      description: "Travel requests, booking management, per diem calculations, expense claims",
      icon: "Plane",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "adm_fleet",
      name: "Company Vehicle / Fleet",
      description: "Vehicle booking, driver assignment, mileage tracking, maintenance schedule",
      icon: "Car",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "adm_notices",
      name: "Company Notice Board",
      description: "Announcements, circulars, event notices, employee communications",
      icon: "Newspaper",
      category: "dashboard_widget",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
    {
      id: "adm_supplies",
      name: "Office Supplies & Stationery",
      description: "Supply requests, inventory tracking, vendor orders, budget tracking",
      icon: "Paperclip",
      category: "page",
      access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
    },
  ],
};

// ─── Universal Features (available to ALL departments) ─────────────────────

export const UNIVERSAL_FEATURES: DepartmentFeature[] = [
  {
    id: "uni_self_service",
    name: "Employee Self-Service",
    description: "View/update personal info, download payslips, request letters",
    icon: "UserCog",
    category: "page",
    access: { department_head: "full", team_manager: "full", team_member: "view_only" },
  },
  {
    id: "uni_leave",
    name: "Leave Application",
    description: "Apply for leaves, view balance, track approval status",
    icon: "CalendarOff",
    category: "page",
    access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
  },
  {
    id: "uni_attendance",
    name: "Attendance Clock",
    description: "Clock in/out, view attendance history",
    icon: "Clock",
    category: "page",
    access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
  },
  {
    id: "uni_announcements",
    name: "Company Announcements",
    description: "View organization-wide announcements and notices",
    icon: "Bell",
    category: "page",
    access: { department_head: "full", team_manager: "view_only", team_member: "view_only" },
  },
  {
    id: "uni_directory",
    name: "Team Directory",
    description: "View department colleagues, reporting hierarchy",
    icon: "Users",
    category: "page",
    access: { department_head: "full", team_manager: "operational", team_member: "view_only" },
  },
  {
    id: "uni_calendar",
    name: "Calendar",
    description: "Company holidays, team events, meeting schedules",
    icon: "Calendar",
    category: "page",
    access: { department_head: "full", team_manager: "view_only", team_member: "view_only" },
  },
];

// ─── Helper Functions ──────────────────────────────────────────────────────

export function getDepartmentBySlug(slug: string): PredefinedDepartment | undefined {
  return PREDEFINED_DEPARTMENTS.find((d) => d.slug === slug);
}

export function getDefaultFeaturesForDept(slug: string): DepartmentFeature[] {
  return DEPARTMENT_FEATURES[slug] || [];
}

export function getDefaultFeatureIdsForDept(slug: string): string[] {
  return getDefaultFeaturesForDept(slug).map((f) => f.id);
}

export function getFeatureById(featureId: string): DepartmentFeature | undefined {
  // Check department features
  for (const features of Object.values(DEPARTMENT_FEATURES)) {
    const found = features.find((f) => f.id === featureId);
    if (found) return found;
  }
  // Check universal features
  return UNIVERSAL_FEATURES.find((f) => f.id === featureId);
}

export function getDepartmentByName(name: string): PredefinedDepartment | undefined {
  return PREDEFINED_DEPARTMENTS.find(
    (d) => d.name.toLowerCase() === name.toLowerCase()
  );
}
