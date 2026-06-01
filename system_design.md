# Employee Management System — System Design Document (Interview Project Edition)

> Complete system design for a highly performant, multi-tenant SAAS Employee Management Platform optimized for a free-tier hosting model (ideal for portfolio/interview showcase).  
> **Database:** MongoDB Atlas (M0 Free Tier)  
> **Hosting & Backend:** Next.js Serverless on Vercel (Free Tier)  
> **Frontend:** Next.js + React + Redux Toolkit + Tailwind CSS  
> **Target Scale:** Demo & portfolio scale (10+ tenants, 1,000+ employee records, running entirely on 100% Free Tiers)

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [System Architecture Diagram](#2-system-architecture-diagram)
3. [Technology Stack](#3-technology-stack)
4. [Multi-Tenancy Design](#4-multi-tenancy-design)
5. [MongoDB Database Design](#5-mongodb-database-design)
6. [API Design](#6-api-design)
7. [Authentication & Authorization Flow](#7-authentication--authorization-flow)
8. [Core Module Data Flows](#8-core-module-data-flows)
9. [Real-Time System (Notifications & WebSockets)](#9-real-time-system-notifications--websockets)
10. [File Storage & Document Management](#10-file-storage--document-management)
11. [Payroll Processing Pipeline](#11-payroll-processing-pipeline)
12. [Search & Filtering Architecture](#12-search--filtering-architecture)
13. [Caching Strategy](#13-caching-strategy)
14. [Background Jobs & Task Queues](#14-background-jobs--task-queues)
15. [Security Architecture](#15-security-architecture)
16. [Scalability & Performance](#16-scalability--performance)
17. [Deployment Architecture](#17-deployment-architecture)
18. [Monitoring, Logging & Observability](#18-monitoring-logging--observability)
19. [Disaster Recovery & Backup](#19-disaster-recovery--backup)
20. [Cost Estimation](#20-cost-estimation)
21. [AI Architecture & Integration](#21-ai-architecture--integration)
22. [SaaS Maker Platform Administration](#22-saas-maker-platform-administration)

---

## 1. High-Level Architecture

The system follows a **modern serverless architecture** with clear separation of concerns:

| Tier | Responsibility | Technologies |
|------|---------------|-------------|
| **Presentation** | UI rendering, state management, client-side routing | Next.js, React, Redux Toolkit, Tailwind CSS |
| **Application** | Business logic, API routing, auth, validation, serverless workflows | Next.js Serverless Route Handlers |
| **Data** | Persistence, caching, file storage, search | MongoDB Atlas (M0), Upstash Redis, Uploadthing / Cloudinary |

### Design Principles

- **Multi-tenant by default** — Every data model includes `orgId` for tenant isolation.
- **Serverless & Lightweight** — Designed to run entirely within Vercel's free serverless runtime execution limits.
- **API-first** — Every feature is accessible via Next.js REST API routes.
- **Auto-scaling** — Leveraging Vercel's global edge network and serverless functions for automatic scale-to-zero.
- **Security-first** — Secure session management, RBAC at API and field level.

---

## 2. System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser["Browser / PWA"]
    end

    subgraph "Hosting & Edge Layer"
        VercelEdge["Vercel Edge Network / CDN"]
    end

    subgraph "Serverless Application Layer (Next.js)"
        API["Next.js App Server / API Routes"]
        subgraph "Application Modules"
            AuthSvc["Auth Module"]
            EmpSvc["Employee Module"]
            AttnSvc["Attendance Module"]
            LeaveSvc["Leave Module"]
            PayrollSvc["Payroll Module"]
            PerfSvc["Performance Module"]
            RecruitSvc["Recruitment Module"]
            NotifSvc["Notification Module"]
        end
    end

    subgraph "Background Workflows"
        Inngest["Inngest / Upstash QStash (Free Tier)"]
    end

    subgraph "Data Layer (Free Tiers)"
        MongoDB["MongoDB Atlas (M0 Free Tier)"]
        Redis["Upstash Redis (Free Tier)"]
        Uploadthing["Uploadthing / Cloudinary (Free Tier)"]
    end

    subgraph "External Services"
        OpenAI["OpenAI API (Pay-as-you-go / Free tier limits)"]
        Email["SendGrid (Free Tier)"]
        OAuth["Google / Microsoft OAuth"]
    end

    Browser --> VercelEdge
    VercelEdge --> API

    API --> AuthSvc
    API --> EmpSvc
    API --> AttnSvc
    API --> LeaveSvc
    API --> PayrollSvc
    API --> PerfSvc
    API --> RecruitSvc
    API --> NotifSvc

    AuthSvc --> MongoDB
    AuthSvc --> Redis
    EmpSvc --> MongoDB
    EmpSvc --> Uploadthing
    AttnSvc --> MongoDB
    LeaveSvc --> MongoDB
    PayrollSvc --> MongoDB
    PayrollSvc --> Inngest
    NotifSvc --> MongoDB
    NotifSvc --> Email

    Inngest --> API
    API --> OpenAI
```

---

## 3. Technology Stack

### Frontend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | Next.js 16 (App Router) | SSR, RSC, API routes, file-based routing |
| UI Library | React 19 | Component-based UI with Server Components |
| Server-State Management | **TanStack Query (React Query v5)** | Caching, background refetching, optimistic updates, deduplication for all API data |
| Client-State Management | **Redux Toolkit** | Complex UI state (sidebar/modal state, client form wizards) |
| Schema Validation | **Zod** | End-to-end type safety — shared schemas between forms, API requests, and API responses |
| Styling | Tailwind CSS 4 | Utility-first, fast iteration |
| Component Library | Shadcn/UI | Accessible, composable components |
| Animations | **Framer Motion** | Micro-animations, page transitions, list animations for premium UX |
| Charts | Recharts | Declarative charts for dashboards |
| Real-time | Pusher JS (Free Tier) / SSE | Real-time notifications on serverless infrastructure |
| Forms | React Hook Form + Zod | Performant forms with Zod-inferred TypeScript types |

### Backend

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Runtime | Node.js 22 LTS | Same language as frontend, async I/O |
| API Routes | Next.js Serverless API Routes | Built-in route handlers running on Vercel |
| ORM / ODM | Mongoose 8 | Schema validation, middleware, population |
| Authentication | NextAuth.js / JWT | OAuth + credential providers |
| Validation | Zod | Runtime type checking, shared with frontend |
| Job Queue | Inngest / Upstash QStash | Serverless-friendly background job processing |
| WebSockets / Real-time | Server-Sent Events (SSE) / Pusher | Works seamlessly in serverless execution environments |
| PDF Generation | @react-pdf/renderer | Payslips, offer letters (lightweight for serverless execution) |
| Email | Nodemailer + SendGrid | Transactional emails |
| AI Integration | **Vercel AI SDK + OpenAI** | Chatbot streaming, RAG logic, semantic embedding generation |

### Data & Infrastructure

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Primary DB | MongoDB Atlas (M0 Free Tier) | Free schema-flexible database, perfect for demo app |
| Vector DB | **MongoDB Atlas Vector Search** | Native vector search on M0 Free Tier for our AI features |
| Cache | Redis (Upstash Free Tier) | Free serverless Redis for session store, rate limiting, caching |
| File Storage | Uploadthing / Cloudinary (Free Tier) | High-performance, free image/document storage |
| Search | MongoDB Atlas Search / Regex | Built-in indexing & full-text search capability |
| Monitoring | Vercel Analytics & Console | Built-in basic analytics, zero-config serverless logging |
| CI/CD | Vercel Git Integration | Automatic zero-config deployments on GitHub push |
| Hosting | Vercel (Free Tier) | High performance edge and serverless hosting |
| DNS | Vercel DNS | Default auto-SSL and edge routing, zero-cost |

---

## 4. Multi-Tenancy Design

### Strategy: Shared Database, Shared Collection with Row-Level Isolation

Every document in MongoDB includes an `orgId` field. All queries are automatically scoped to the tenant.

```mermaid
graph LR
    subgraph "Single MongoDB Atlas Cluster"
        DB["ems_production Database"]
        subgraph "employees Collection"
            D1["Doc: orgId=org_001, name=Alice"]
            D2["Doc: orgId=org_001, name=Bob"]
            D3["Doc: orgId=org_002, name=Charlie"]
            D4["Doc: orgId=org_003, name=Diana"]
        end
    end

    Tenant1["Tenant 1: Acme Corp (org_001)"] --> D1
    Tenant1 --> D2
    Tenant2["Tenant 2: Globex Inc (org_002)"] --> D3
    Tenant3["Tenant 3: Initech (org_003)"] --> D4

    style D1 fill:#dbeafe
    style D2 fill:#dbeafe
    style D3 fill:#dcfce7
    style D4 fill:#fef3c7
```

### Why This Strategy?

| Factor | Shared Collections (Chosen) | Separate DBs per Tenant |
|--------|----------------------------|------------------------|
| Cost | ✅ Low (single cluster) | ❌ High (DB per tenant) |
| Operational Complexity | ✅ Low | ❌ High (migrations x N) |
| Tenant Isolation | ⚠️ Logical (orgId index) | ✅ Physical |
| Scale to 10K tenants | ✅ Easy | ❌ Impractical |
| Cross-tenant queries | ✅ Possible (for analytics) | ❌ Complex |

### Enforcement Layers

1. **Mongoose Middleware:** Every `find`, `findOne`, `update`, `delete` query is automatically injected with `{ orgId: req.user.orgId }` via a Mongoose plugin.
2. **API Middleware:** Express/Next.js middleware extracts `orgId` from the JWT token and attaches it to the request context.
3. **Index Strategy:** Every collection has a compound index starting with `orgId` for performance.

### 4.4 Tenant Suspension & Platform Impersonation Architecture

To govern the multi-tenant landscape, the platform supports two critical administrative states at the routing layer:

1. **Active Suspension Check (Gatekeeper Middleware):**
   - Every API request passes through a lightweight check verifying the status of the associated organization in a fast-access Upstash Redis cache (synced with MongoDB `organizations.subscription.status`).
   - If the tenant status is `suspended`, the gateway immediately terminates the request with a `403 Forbidden` response, rendering a read-only lock overlay on the client application for all users of that tenant, blocking all write actions except for the billing portal.

2. **Tenant Impersonation Flow:**
   - Platform admins can securely impersonate a Tenant Admin to troubleshoot configurations without requesting user passwords.
   - **Token Exchange Mechanism:** The platform admin clicks "Impersonate" -> Serverless backend validates the admin's session -> Generates a special JWT payload that sets `orgId` to the target tenant's ID, `userId` to a virtual impersonation identity, and adds a metadata claim `isImpersonating: true` and `impersonatorAdminId: platform_admin_id`.
   - **Mongoose / Audit Sync:** The Mongoose plugin transparently scopes all database queries to the target `orgId`. Any modifications made during this session write to the target organization's collections but tag the action in the `audit_logs` with `userId: virtual_impersonation_id` and include the platform admin's ID in the metadata to ensure compliance.

---

## 5. MongoDB Database Design

### 5.1 Database: `ems_production`

### Collection Relationship Diagram

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : "has members"
    ORGANIZATIONS ||--o{ BRANCHES : "has locations"
    ORGANIZATIONS ||--o{ DEPARTMENTS : "has departments"
    ORGANIZATIONS ||--o{ EMPLOYEES : "has employees"
    ORGANIZATIONS ||--o{ LEAVE_POLICIES : "configures"
    ORGANIZATIONS ||--o{ SALARY_TEMPLATES : "defines"
    ORGANIZATIONS ||--o{ SUBSCRIPTIONS : "subscribes"

    DEPARTMENTS ||--o{ EMPLOYEES : "contains"
    BRANCHES ||--o{ EMPLOYEES : "located at"
    EMPLOYEES ||--o{ ATTENDANCE_RECORDS : "logs"
    EMPLOYEES ||--o{ LEAVE_REQUESTS : "applies"
    EMPLOYEES ||--o{ PAYROLL_RUNS : "receives"
    EMPLOYEES ||--o{ DOCUMENTS : "uploads"
    EMPLOYEES ||--o{ PERFORMANCE_REVIEWS : "undergoes"
    EMPLOYEES ||--o{ GOALS : "has"
    EMPLOYEES ||--o{ SESSIONS : "has"

    USERS ||--|| EMPLOYEES : "maps to"
    LEAVE_POLICIES ||--o{ LEAVE_REQUESTS : "governs"
    SALARY_TEMPLATES ||--o{ PAYROLL_RUNS : "applied in"

    JOB_POSTINGS ||--o{ APPLICANTS : "receives"
    APPLICANTS ||--o{ INTERVIEWS : "scheduled for"

    ORGANIZATIONS {
        ObjectId _id PK
        string name
        string slug
        object settings
    }

    USERS {
        ObjectId _id PK
        ObjectId orgId FK
        string email
        string passwordHash
        string role
    }

    EMPLOYEES {
        ObjectId _id PK
        ObjectId orgId FK
        ObjectId departmentId FK
        ObjectId branchId FK
        ObjectId reportingManagerId FK
        string employeeId
        object personalInfo
        object employmentInfo
        object compensationInfo
    }

    ATTENDANCE_RECORDS {
        ObjectId _id PK
        ObjectId orgId FK
        ObjectId employeeId FK
        Date date
        DateTime clockIn
        DateTime clockOut
        number totalHours
    }

    LEAVE_REQUESTS {
        ObjectId _id PK
        ObjectId orgId FK
        ObjectId employeeId FK
        string leaveType
        Date startDate
        Date endDate
        string status
    }

    PAYROLL_RUNS {
        ObjectId _id PK
        ObjectId orgId FK
        ObjectId employeeId FK
        string month
        number grossPay
        number netPay
        object breakdown
    }
```

---

### 5.2 Collection Schemas (Detailed)

#### `organizations`

```
{
  _id: ObjectId,
  name: "Acme Corp",
  slug: "acme-corp",                    // URL-safe identifier
  logo: "https://s3.../acme-logo.png",
  industry: "Technology",
  address: {
    street: "123 Main St",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    zipCode: "560001"
  },
  settings: {
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
    fiscalYearStart: "April",
    workingDaysPerWeek: 5,
    workingHoursPerDay: 8,
    gracePeriodMinutes: 15,
    halfDayThresholdHours: 4
  },
  subscription: {
    plan: "professional",           // starter | professional | enterprise
    status: "active",               // active | trial | suspended
    trialEndsAt: ISODate,
    currentPeriodEnd: ISODate
  },
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { slug: 1 } (unique)
  - { "subscription.status": 1 }
```

#### `users`

```
{
  _id: ObjectId,
  orgId: ObjectId,                       // FK → organizations
  employeeId: ObjectId,                  // FK → employees (nullable for super admin)
  email: "alice@acme.com",
  passwordHash: "$2b$12$...",            // bcrypt
  role: "hr_admin",                      // super_admin | hr_admin | manager | employee | finance | recruiter
  customRoleId: ObjectId,               // FK → roles (if using custom role)
  mfa: {
    enabled: true,
    secret: "encrypted_totp_secret",
    backupCodes: ["encrypted_code_1", "encrypted_code_2"]
  },
  status: "active",                      // active | inactive | locked
  lastLoginAt: ISODate,
  failedLoginAttempts: 0,
  lockedUntil: null,
  passwordChangedAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, email: 1 } (unique compound)
  - { email: 1 }
  - { orgId: 1, role: 1 }
  - { orgId: 1, status: 1 }
```

#### `sessions`

```
{
  _id: ObjectId,
  userId: ObjectId,                      // FK → users
  orgId: ObjectId,
  token: "hashed_refresh_token",
  deviceInfo: {
    userAgent: "Mozilla/5.0...",
    ip: "103.21.x.x",
    location: "Bangalore, India",
    device: "Chrome on MacOS"
  },
  expiresAt: ISODate,
  createdAt: ISODate
}

Indexes:
  - { userId: 1 }
  - { token: 1 } (unique)
  - { expiresAt: 1 } (TTL index — auto-delete expired sessions)
```

#### `employees`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  employeeId: "EMP-2026-0042",          // Human-readable, auto-generated
  personalInfo: {
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@acme.com",
    phone: "+91-9876543210",
    dateOfBirth: ISODate("1995-03-15"),
    gender: "female",
    bloodGroup: "O+",
    profilePhoto: "https://s3.../photo.jpg",
    emergencyContacts: [
      { name: "Bob Johnson", relation: "Spouse", phone: "+91-9876543211" }
    ]
  },
  employmentInfo: {
    designation: "Senior Software Engineer",
    departmentId: ObjectId,              // FK → departments
    branchId: ObjectId,                  // FK → branches
    reportingManagerId: ObjectId,        // FK → employees (self-ref)
    employmentType: "full-time",         // full-time | part-time | contract | intern
    dateOfJoining: ISODate("2023-06-01"),
    probationEndDate: ISODate("2023-12-01"),
    confirmationDate: ISODate("2023-12-01"),
    status: "active",                    // onboarding | probation | active | on_notice | resigned | terminated | retired
    statusHistory: [
      { status: "onboarding", changedAt: ISODate, changedBy: ObjectId, reason: "New hire" },
      { status: "probation", changedAt: ISODate, changedBy: ObjectId, reason: "Joined" },
      { status: "active", changedAt: ISODate, changedBy: ObjectId, reason: "Probation completed" }
    ]
  },
  compensationInfo: {
    salaryTemplateId: ObjectId,          // FK → salary_templates
    baseSalary: 1200000,                 // Annual in smallest currency unit (paise/cents)
    bankDetails: {
      accountNumber: "encrypted_xxx",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India"
    },
    panNumber: "encrypted_ABCDE1234F",
    taxId: "encrypted_xxx"
  },
  addressInfo: {
    current: { street: "...", city: "Bangalore", state: "Karnataka", country: "India", zipCode: "560001" },
    permanent: { street: "...", city: "Delhi", state: "Delhi", country: "India", zipCode: "110001" }
  },
  leaveBalances: {
    casual: { allocated: 12, used: 3, pending: 1, remaining: 8 },
    sick: { allocated: 10, used: 2, pending: 0, remaining: 8 },
    earned: { allocated: 15, used: 0, pending: 0, remaining: 15 },
    compOff: { allocated: 0, used: 0, pending: 0, remaining: 0 }
  },
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, employeeId: 1 } (unique)
  - { orgId: 1, "employmentInfo.departmentId": 1 }
  - { orgId: 1, "employmentInfo.branchId": 1 }
  - { orgId: 1, "employmentInfo.status": 1 }
  - { orgId: 1, "employmentInfo.reportingManagerId": 1 }
  - { orgId: 1, "personalInfo.email": 1 }
  - { orgId: 1, "employmentInfo.dateOfJoining": 1 }
  
  // Atlas Search index for full-text search:
  - Atlas Search on: personalInfo.firstName, personalInfo.lastName, 
    personalInfo.email, employeeId, employmentInfo.designation
```

#### `departments`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  name: "Engineering",
  description: "Product development team",
  headId: ObjectId,                       // FK → employees
  parentDepartmentId: ObjectId | null,    // FK → departments (for sub-departments)
  budget: {
    annual: 50000000,
    currency: "INR"
  },
  status: "active",
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, name: 1 } (unique)
  - { orgId: 1, parentDepartmentId: 1 }
```

#### `branches`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  name: "Bangalore HQ",
  address: { street, city, state, country, zipCode },
  timezone: "Asia/Kolkata",
  holidays: [
    { date: ISODate("2026-01-26"), name: "Republic Day", type: "public" },
    { date: ISODate("2026-08-15"), name: "Independence Day", type: "public" },
    { date: ISODate("2026-11-01"), name: "Kannada Rajyotsava", type: "restricted" }
  ],
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, name: 1 } (unique)
```

#### `attendance_records`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  employeeId: ObjectId,
  date: ISODate("2026-05-31"),            // Date only (no time)
  clockIn: ISODate("2026-05-31T09:02:00"),
  clockOut: ISODate("2026-05-31T18:15:00"),
  breaks: [
    { start: ISODate("2026-05-31T13:00:00"), end: ISODate("2026-05-31T13:45:00") }
  ],
  totalHours: 8.47,
  effectiveHours: 7.72,                    // totalHours - breaks
  overtimeHours: 0.25,
  status: "present",                       // present | absent | half_day | on_leave | holiday | weekend
  lateBy: 2,                               // minutes late (grace period applied)
  source: "web",                           // web | mobile | biometric | manual
  location: {
    latitude: 12.9716,
    longitude: 77.5946,
    ip: "103.21.x.x"
  },
  regularizationRequest: {
    requested: false,
    reason: null,
    approvedBy: null,
    approvedAt: null
  },
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, employeeId: 1, date: 1 } (unique compound)
  - { orgId: 1, date: 1, status: 1 }
  - { orgId: 1, date: 1 }
```

#### `leave_requests`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  employeeId: ObjectId,
  leaveType: "casual",                     // casual | sick | earned | maternity | paternity | comp_off | lop | wfh
  startDate: ISODate("2026-06-10"),
  endDate: ISODate("2026-06-12"),
  totalDays: 3,
  isHalfDay: false,
  halfDayType: null,                        // first_half | second_half
  reason: "Family function",
  status: "pending",                        // pending | approved | rejected | cancelled
  approvalChain: [
    {
      approverId: ObjectId,
      approverName: "Manager Name",
      level: 1,
      status: "pending",                    // pending | approved | rejected
      comment: null,
      actedAt: null
    }
  ],
  appliedAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, employeeId: 1, status: 1 }
  - { orgId: 1, status: 1, appliedAt: -1 }
  - { orgId: 1, "approvalChain.approverId": 1, status: 1 }
  - { orgId: 1, startDate: 1, endDate: 1 }
```

#### `leave_policies`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  leaveType: "casual",
  displayName: "Casual Leave",
  annualQuota: 12,
  accrualFrequency: "monthly",              // monthly | quarterly | yearly | upfront
  carryForward: {
    enabled: true,
    maxDays: 5,
    expiryMonths: 3                          // Carried-forward leaves expire after 3 months
  },
  encashment: {
    enabled: false,
    maxDays: 0,
    ratePerDay: 0
  },
  probationEligible: false,                 // Can employees on probation use this?
  genderApplicable: "all",                  // all | male | female
  minConsecutiveDays: 1,
  maxConsecutiveDays: 5,
  requiresDocumentation: false,             // e.g., medical certificate for sick leave
  documentationAfterDays: 3,               // Require docs if >3 consecutive sick days
  approvalLevels: 1,                        // Number of approval levels needed
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, leaveType: 1 } (unique)
```

#### `salary_templates`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  name: "Standard FTE India",
  components: {
    earnings: [
      { name: "Basic Pay", code: "BASIC", type: "percentage", value: 40, of: "gross" },
      { name: "HRA", code: "HRA", type: "percentage", value: 50, of: "basic" },
      { name: "Special Allowance", code: "SPL", type: "remainder", value: 0 }
    ],
    deductions: [
      { name: "Provident Fund", code: "PF", type: "percentage", value: 12, of: "basic", maxAmount: 21600 },
      { name: "ESI", code: "ESI", type: "percentage", value: 0.75, of: "gross", applicableBelow: 2100000 },
      { name: "Professional Tax", code: "PT", type: "slab", slabs: [
        { from: 0, to: 1000000, amount: 0 },
        { from: 1000001, to: 1500000, amount: 1500 },
        { from: 1500001, to: null, amount: 2500 }
      ]}
    ]
  },
  status: "active",
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, name: 1 } (unique)
  - { orgId: 1, status: 1 }
```

#### `payroll_runs`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  employeeId: ObjectId,
  runId: ObjectId,                           // Groups all employees in a single payroll run
  month: "2026-05",                          // YYYY-MM
  workingDays: 22,
  daysWorked: 21,
  lopDays: 1,
  overtimeHours: 4.5,
  breakdown: {
    earnings: {
      basic: 40000,
      hra: 20000,
      specialAllowance: 25000,
      overtimePay: 3750,
      reimbursements: 5000
    },
    grossPay: 93750,
    deductions: {
      pf: 4800,
      esi: 0,
      professionalTax: 200,
      tds: 7500,
      lopDeduction: 4091
    },
    totalDeductions: 16591,
    netPay: 77159
  },
  payslipUrl: "https://s3.../payslip_2026_05_EMP042.pdf",
  status: "processed",                       // draft | processing | processed | paid | error
  paidAt: ISODate,
  createdAt: ISODate
}

Indexes:
  - { orgId: 1, employeeId: 1, month: 1 } (unique)
  - { orgId: 1, runId: 1 }
  - { orgId: 1, month: 1, status: 1 }
```

#### `performance_reviews`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  employeeId: ObjectId,
  cycleId: ObjectId,                         // FK → review_cycles
  cycleName: "H1 2026 Review",
  selfAssessment: {
    submitted: true,
    submittedAt: ISODate,
    responses: [
      { questionId: ObjectId, question: "Key achievements", answer: "..." }
    ]
  },
  managerReview: {
    reviewerId: ObjectId,
    goalRatings: [
      { goalId: ObjectId, rating: 4, comment: "Exceeded target by 20%" }
    ],
    competencyRatings: [
      { competency: "Technical Skills", rating: 5 },
      { competency: "Communication", rating: 3 },
      { competency: "Leadership", rating: 4 }
    ],
    overallRating: 4,                        // 1-5 scale
    overallComment: "Strong performer...",
    submittedAt: ISODate
  },
  peerFeedback: [
    {
      peerId: ObjectId,
      anonymous: true,
      ratings: { teamwork: 4, communication: 3, reliability: 5 },
      comment: "Great to work with...",
      submittedAt: ISODate
    }
  ],
  finalRating: "exceeds_expectations",       // exceeds | meets | needs_improvement | below
  status: "completed",                       // pending_self | pending_manager | pending_calibration | completed
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, employeeId: 1, cycleId: 1 } (unique)
  - { orgId: 1, cycleId: 1, status: 1 }
  - { orgId: 1, cycleId: 1, finalRating: 1 }
```

#### `goals`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  employeeId: ObjectId,
  cycleId: ObjectId,
  title: "Increase API response time by 30%",
  description: "Optimize database queries and add caching...",
  measurableTarget: "P95 latency < 200ms",
  weight: 25,                                // Percentage weight in review
  deadline: ISODate("2026-06-30"),
  status: "in_progress",                     // not_started | in_progress | completed | overdue
  progress: 60,                              // 0-100 percentage
  keyResults: [
    { title: "Add Redis caching to top 5 endpoints", completed: true },
    { title: "Optimize MongoDB queries", completed: true },
    { title: "Reduce payload sizes", completed: false }
  ],
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, employeeId: 1, cycleId: 1 }
  - { orgId: 1, cycleId: 1, status: 1 }
```

#### `job_postings`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  title: "Senior Frontend Engineer",
  departmentId: ObjectId,
  branchId: ObjectId,
  description: "We are looking for...",
  requirements: ["3+ years React", "TypeScript", "Next.js"],
  salaryRange: { min: 1500000, max: 2500000, currency: "INR" },
  employmentType: "full-time",
  status: "open",                            // draft | open | closed | on_hold
  publishedTo: ["careers_page", "linkedin", "naukri"],
  hiringManagerId: ObjectId,
  applicantCount: 42,
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, status: 1 }
  - { orgId: 1, departmentId: 1 }
```

#### `applicants`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  jobPostingId: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  phone: "+91-9876543210",
  resumeUrl: "https://s3.../resume.pdf",
  source: "linkedin",                       // linkedin | careers_page | referral | naukri
  referredBy: ObjectId | null,
  stage: "interview",                       // applied | screening | interview | offer | hired | rejected
  stageHistory: [
    { stage: "applied", changedAt: ISODate, changedBy: ObjectId },
    { stage: "screening", changedAt: ISODate, changedBy: ObjectId },
    { stage: "interview", changedAt: ISODate, changedBy: ObjectId }
  ],
  interviews: [
    {
      scheduledAt: ISODate,
      interviewerIds: [ObjectId],
      type: "technical",                    // screening | technical | managerial | hr
      feedback: {
        rating: 4,
        strengths: "Strong problem solving...",
        weaknesses: "Needs more system design...",
        recommendation: "hire"              // hire | no_hire | strong_hire | strong_no_hire
      }
    }
  ],
  offerDetails: {
    salary: 1800000,
    designation: "Senior Frontend Engineer",
    joiningDate: ISODate,
    status: null                            // sent | viewed | accepted | declined | negotiating
  },
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, jobPostingId: 1, email: 1 } (unique)
  - { orgId: 1, stage: 1 }
  - { orgId: 1, jobPostingId: 1, stage: 1 }
```

#### `documents`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  employeeId: ObjectId | null,              // null for company-wide docs
  category: "id_proof",                     // id_proof | education | employment | tax | policy | letter
  name: "Aadhaar Card",
  fileUrl: "https://s3.../encrypted_aadhaar.pdf",
  fileSize: 245000,                         // bytes
  mimeType: "application/pdf",
  version: 2,
  previousVersions: [
    { fileUrl: "https://s3.../old_aadhaar.pdf", uploadedAt: ISODate }
  ],
  isCompanyPolicy: false,
  acknowledgements: [                       // Only for company policies
    { employeeId: ObjectId, acknowledgedAt: ISODate, signature: "data:image/png;base64,..." }
  ],
  uploadedBy: ObjectId,
  expiresAt: ISODate | null,               // For documents like visas that expire
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, employeeId: 1, category: 1 }
  - { orgId: 1, isCompanyPolicy: 1 }
  - { expiresAt: 1 }                       // TTL or alert on expiring docs
```

#### `notifications`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  recipientId: ObjectId,                    // FK → users
  type: "leave_approved",                   // leave_approved | payslip_generated | review_due | announcement | etc.
  category: "hr",                           // hr | performance | attendance | system
  title: "Leave Approved",
  message: "Your casual leave from Jun 10-12 has been approved by Manager Name.",
  data: {                                   // Contextual data for navigation
    leaveRequestId: ObjectId,
    link: "/leaves/requests/xxx"
  },
  channels: {
    inApp: { sent: true, readAt: null },
    email: { sent: true, sentAt: ISODate },
    push: { sent: false }
  },
  isRead: false,
  isArchived: false,
  createdAt: ISODate
}

Indexes:
  - { orgId: 1, recipientId: 1, isRead: 1, createdAt: -1 }
  - { orgId: 1, recipientId: 1, isArchived: 1 }
  - { createdAt: 1 } (TTL: auto-delete after 90 days)
```

#### `audit_logs`

```
{
  _id: ObjectId,
  orgId: ObjectId,
  userId: ObjectId,
  userName: "Alice Johnson",
  action: "employee.update",                 // resource.action format
  resource: "employees",
  resourceId: ObjectId,
  changes: {
    before: { "compensationInfo.baseSalary": 1000000 },
    after: { "compensationInfo.baseSalary": 1200000 }
  },
  metadata: {
    ip: "103.21.x.x",
    userAgent: "Mozilla/5.0...",
    sessionId: ObjectId
  },
  timestamp: ISODate
}

Indexes:
  - { orgId: 1, timestamp: -1 }
  - { orgId: 1, userId: 1, timestamp: -1 }
  - { orgId: 1, resource: 1, resourceId: 1, timestamp: -1 }
  - { orgId: 1, action: 1, timestamp: -1 }
  - { timestamp: 1 } (TTL: 3 years)
```

#### `roles` (Custom RBAC)

```
{
  _id: ObjectId,
  orgId: ObjectId,
  name: "Regional HR",
  description: "HR access limited to a specific branch",
  permissions: [
    "employee.read",
    "employee.write",
    "leave.read",
    "leave.approve",
    "attendance.read",
    "attendance.write",
    "report.read"
  ],
  fieldPermissions: {
    employees: {
      hidden: ["compensationInfo.baseSalary", "compensationInfo.bankDetails", "compensationInfo.panNumber"]
    }
  },
  scope: {
    type: "branch",                         // all | branch | department
    branchIds: [ObjectId]                   // Only access employees in these branches
  },
  isSystemRole: false,                      // true for predefined roles
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, name: 1 } (unique)
  - { orgId: 1, isSystemRole: 1 }
```

#### `tickets` (Help Desk)

```
{
  _id: ObjectId,
  orgId: ObjectId,
  ticketId: "TKT-2026-0001",
  raisedBy: ObjectId,
  assignedTo: ObjectId | null,
  category: "leave_query",                  // leave_query | payroll_issue | document_request | general
  priority: "medium",                       // low | medium | high | urgent
  subject: "Leave balance mismatch",
  description: "My CL balance shows 8 but I've only taken 2...",
  status: "open",                           // open | in_progress | waiting_on_employee | resolved | closed
  messages: [
    {
      senderId: ObjectId,
      message: "Could you share a screenshot?",
      attachments: [],
      sentAt: ISODate
    }
  ],
  sla: {
    responseDeadline: ISODate,
    resolutionDeadline: ISODate,
    breached: false
  },
  resolvedAt: ISODate | null,
  closedAt: ISODate | null,
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
  - { orgId: 1, ticketId: 1 } (unique)
  - { orgId: 1, status: 1, priority: 1 }
  - { orgId: 1, raisedBy: 1, status: 1 }
  - { orgId: 1, assignedTo: 1, status: 1 }
```

#### `platform_admins`

```
{
  _id: ObjectId,
  email: "owner@saasplatform.com",
  passwordHash: "$2b$12$...",
  name: "Super Owner",
  role: "platform_owner",                 // platform_owner | platform_support
  mfa: {
    enabled: true,
    secret: "encrypted_totp_secret",
    backupCodes: ["encrypted_code_1", "encrypted_code_2"]
  },
  lastLoginAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

Indexes:
  - { email: 1 } (unique)

#### `subscription_plans`

```
{
  _id: ObjectId,
  key: "starter",                         // starter | professional | enterprise
  name: "Starter Plan",
  priceMonthly: 0,
  maxEmployees: 5,
  maxStorageBytes: 2147483648,            // 2GB
  maxEmailsPerDay: 100,
  features: {
    coreHR: true,
    recruitment: false,
    payroll: false,
    performanceReviews: false,
    aiCopilot: false,
    customRBAC: false
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

Indexes:
  - { key: 1 } (unique)

#### `platform_announcements`

```
{
  _id: ObjectId,
  title: "Scheduled Maintenance Notification",
  content: "The platform will undergo scheduled maintenance on Sunday...",
  targetScope: "pricing_tier",            // all | pricing_tier | single_tenant
  targetTier: "starter",                  // nullable, starter | professional | enterprise
  targetOrgId: ObjectId,                  // nullable, FK → organizations
  type: "warning",                        // info | warning | alert
  displayStyle: "banner",                 // banner | modal
  activeFrom: ISODate,
  activeTo: ISODate,
  dismissedByUsers: [ObjectId],           // Array of userIds who dismissed the banner
  createdAt: ISODate,
  updatedAt: ISODate
}
```

Indexes:
  - { activeFrom: 1, activeTo: 1 }
  - { targetScope: 1, targetTier: 1 }
  - { targetOrgId: 1 }

#### `platform_audit_logs`

```
{
  _id: ObjectId,
  adminId: ObjectId,                      // FK → platform_admins
  adminName: "Super Owner",
  action: "tenant.suspend",               // impersonate | tenant.suspend | tenant.unsuspend | plan.update | announcement.create
  targetTenantId: ObjectId,               // FK → organizations (nullable)
  targetTenantName: "Acme Corp",
  metadata: {
    ip: "103.21.x.x",
    userAgent: "Mozilla/5.0...",
    impersonationReason: "Debugging leave query issue for tenant admin"
  },
  timestamp: ISODate
}
```

Indexes:
  - { action: 1, timestamp: -1 }
  - { targetTenantId: 1, timestamp: -1 }
  - { adminId: 1, timestamp: -1 }
```

---

### 5.3 MongoDB Collection Summary

| # | Collection | Estimated Size (1K employees) | Sharding Key | TTL |
|---|-----------|-------------------------------|-------------|-----|
| 1 | organizations | Tiny (~10 docs) | — | — |
| 2 | users | ~1K docs | orgId | — |
| 3 | sessions | ~2K docs | userId | 30 days |
| 4 | employees | ~1K docs | orgId | — |
| 5 | departments | ~50 docs | orgId | — |
| 6 | branches | ~10 docs | orgId | — |
| 7 | attendance_records | ~22K/month | orgId + date | 3 years |
| 8 | leave_requests | ~500/month | orgId | — |
| 9 | leave_policies | ~10 docs | orgId | — |
| 10 | salary_templates | ~5 docs | orgId | — |
| 11 | payroll_runs | ~1K/month | orgId + month | 7 years |
| 12 | performance_reviews | ~2K/year | orgId | — |
| 13 | goals | ~3K/year | orgId | — |
| 14 | job_postings | ~50/year | orgId | — |
| 15 | applicants | ~500/year | orgId | — |
| 16 | documents | ~5K docs | orgId | — |
| 17 | notifications | ~10K/month | orgId + recipientId | 90 days |
| 18 | audit_logs | ~50K/month | orgId + timestamp | 3 years |
| 19 | roles | ~10 docs | orgId | — |
| 20 | tickets | ~100/month | orgId | — |
| 21 | platform_admins | Tiny (<5 docs) | — | — |
| 22 | subscription_plans | Tiny (~3 docs) | — | — |
| 23 | platform_announcements | Tiny (~10 docs) | — | — |
| 24 | platform_audit_logs | ~1K/month | timestamp | 1 year |

---

## 6. API Design

### 6.1 API Structure

```
Base URL: https://api.emshub.com/api/v1

Authentication: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json
X-Org-Id: org_xxxx  (extracted from JWT, never sent by client)
```

### 6.2 RESTful Endpoint Map

```mermaid
graph LR
    subgraph "Auth Endpoints"
        A1["POST /auth/register"]
        A2["POST /auth/login"]
        A3["POST /auth/refresh"]
        A4["POST /auth/logout"]
        A5["POST /auth/forgot-password"]
        A6["POST /auth/reset-password"]
        A7["POST /auth/mfa/setup"]
        A8["POST /auth/mfa/verify"]
    end

    subgraph "Employee Endpoints"
        E1["GET /employees"]
        E2["POST /employees"]
        E3["GET /employees/:id"]
        E4["PATCH /employees/:id"]
        E5["DELETE /employees/:id"]
        E6["GET /employees/:id/attendance"]
        E7["GET /employees/:id/leaves"]
        E8["GET /employees/:id/payslips"]
        E9["GET /employees/:id/reviews"]
        E10["POST /employees/bulk"]
    end

    subgraph "Attendance Endpoints"
        AT1["POST /attendance/clock-in"]
        AT2["POST /attendance/clock-out"]
        AT3["GET /attendance/today"]
        AT4["GET /attendance/calendar/:employeeId"]
        AT5["POST /attendance/regularize"]
    end

    subgraph "Leave Endpoints"
        L1["POST /leaves/apply"]
        L2["GET /leaves/my-requests"]
        L3["GET /leaves/pending-approvals"]
        L4["PATCH /leaves/:id/approve"]
        L5["PATCH /leaves/:id/reject"]
        L6["GET /leaves/balances"]
        L7["GET /leaves/team-calendar"]
    end

    subgraph "Payroll Endpoints"
        P1["POST /payroll/process"]
        P2["GET /payroll/runs"]
        P3["GET /payroll/runs/:runId"]
        P4["GET /payroll/payslips/:employeeId/:month"]
        P5["GET /payroll/summary"]
    end
```

### 6.3 Pagination, Filtering & Sorting Convention

```
GET /api/v1/employees?
  page=1&
  limit=25&
  sort=-employmentInfo.dateOfJoining&
  filter[employmentInfo.status]=active&
  filter[employmentInfo.departmentId]=64a1b2c3d4e5f6&
  search=alice&
  fields=personalInfo.firstName,personalInfo.lastName,employmentInfo.designation
```

**Response Format:**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "totalDocs": 342,
    "totalPages": 14,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 6.4 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "personalInfo.email", "message": "Email is required" },
      { "field": "personalInfo.phone", "message": "Invalid phone format" }
    ]
  }
}
```

### 6.5 Rate Limiting

| Tier | Limit | Window |
|------|-------|--------|
| Standard (per user) | 100 requests | 1 minute |
| Auth endpoints | 10 requests | 1 minute |
| Bulk operations | 5 requests | 1 minute |
| API keys (integrations) | 1000 requests | 1 minute |
| Webhook delivery | 500 per event | 1 hour |

---

## 7. Authentication & Authorization Flow

### 7.1 Login Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextJS as Next.js Server
    participant AuthAPI as Auth Service
    participant MongoDB
    participant Redis

    User->>Browser: Enter email + password
    Browser->>NextJS: POST /api/v1/auth/login
    NextJS->>AuthAPI: Validate credentials
    AuthAPI->>MongoDB: Find user by email
    MongoDB-->>AuthAPI: User document
    AuthAPI->>AuthAPI: Compare bcrypt hash
    
    alt MFA Enabled
        AuthAPI-->>Browser: 200 { mfaRequired: true, tempToken }
        User->>Browser: Enter TOTP code
        Browser->>AuthAPI: POST /api/v1/auth/mfa/verify
        AuthAPI->>AuthAPI: Verify TOTP
    end

    AuthAPI->>AuthAPI: Generate JWT access token (15 min)
    AuthAPI->>AuthAPI: Generate refresh token (7 days)
    AuthAPI->>Redis: Store session { userId, orgId, deviceInfo }
    AuthAPI->>MongoDB: Insert session document
    AuthAPI-->>Browser: 200 { accessToken, refreshToken, user }
    Browser->>Browser: Store tokens (httpOnly cookie)
    Browser->>Browser: Redux: dispatch(setAuth({ user, org }))
```

### 7.2 JWT Token Structure

```
Access Token Payload:
{
  sub: "user_id",
  orgId: "org_id",
  role: "hr_admin",
  permissions: ["employee.read", "employee.write", ...],
  sessionId: "session_id",
  iat: 1717142400,
  exp: 1717143300    // 15 minutes
}

Refresh Token:
  - Opaque token (random 256-bit string)
  - Stored hashed in sessions collection
  - 7-day expiry with rotation on use
```

### 7.3 Authorization Middleware Flow

```mermaid
flowchart TD
    A["Incoming API Request"] --> B{"Has Authorization Header?"}
    B -- No --> C["401 Unauthorized"]
    B -- Yes --> D["Extract & Verify JWT"]
    D -- Invalid/Expired --> E["401 Token Expired"]
    D -- Valid --> F["Extract orgId, role, permissions"]
    F --> G{"Is Session Active in Redis?"}
    G -- No --> H["401 Session Revoked"]
    G -- Yes --> I{"Has Required Permission?"}
    I -- No --> J["403 Forbidden"]
    I -- Yes --> K{"Is orgId Scope Valid?"}
    K -- No --> L["403 Cross-Tenant Access Denied"]
    K -- Yes --> M["Inject orgId into Query Context"]
    M --> N{"Field-Level Permissions?"}
    N -- Yes --> O["Filter Response Fields"]
    N -- No --> P["Return Full Response"]
    O --> Q["200 OK (Filtered)"]
    P --> Q
```

### 7.4 Platform Owner Authentication & Multi-Tenancy Bypass

Authentication and authorization for Platform Owners (SaaS Makers) are separated from the standard multi-tenant login pipeline:

1. **Dedicated Authentication Endpoint:**
   - Platform Owners authenticate via `/api/platform/auth/login` using their credentials from the `platform_admins` collection.
   - Session storage in Redis has a distinct namespace (`session:platform:<adminId>`) to prevent mixing with normal tenant sessions.

2. **Distinct Token Claims:**
   - The platform admin JWT contains no standard `orgId` claim, which prevents standard tenant-scoped API routes from executing queries for them directly.
   - Instead, the token contains a `role: "platform_owner"` claim and full platform-wide authorization scopes (`platform:all` or specific subsets).

3. **Multi-Tenancy Bypass for System APIs:**
   - Standard APIs route requests through tenant-scoping middleware that automatically appends `orgId = req.user.orgId`.
   - Platform Owner APIs bypass this constraint. They use specialized route handlers scoped under `/api/platform/` which are protected by `platformOwnerAuth` middleware. This middleware verifies that `role === "platform_owner"`, allowing unrestricted access across all tenant data when running aggregations or performing administrative operations.

---

## 8. Core Module Data Flows

### 8.1 Employee CRUD Flow

```mermaid
sequenceDiagram
    actor HRAdmin as HR Admin
    participant UI as React UI
    participant Redux as Redux Store
    participant API as API Server
    participant MongoDB
    participant Queue as Job Queue
    participant NotifSvc as Notification Service

    HRAdmin->>UI: Fill "Add Employee" form
    UI->>Redux: dispatch(createEmployee(data))
    Redux->>API: POST /api/v1/employees
    API->>API: Validate with Zod schema
    API->>API: Check RBAC permissions
    API->>MongoDB: Generate employeeId (EMP-2026-XXXX)
    API->>MongoDB: Insert employee document
    MongoDB-->>API: Created document
    API->>Queue: Emit "employee.created" event
    Queue->>NotifSvc: Process notification
    NotifSvc->>MongoDB: Create notification for manager
    NotifSvc->>NotifSvc: Send welcome email
    API-->>Redux: 201 { employee }
    Redux->>Redux: employeesAdapter.addOne(employee)
    Redux-->>UI: Re-render employee list
```

### 8.2 Leave Application & Approval Flow

```mermaid
flowchart TD
    A["Employee Opens Leave Form"] --> B["Selects Leave Type, Dates, Reason"]
    B --> C{"Client Validation"}
    C -- Fail --> D["Show Validation Errors"]
    C -- Pass --> E["POST /api/v1/leaves/apply"]
    E --> F{"Server Validation"}
    F -- "Insufficient Balance" --> G["400: Insufficient leave balance"]
    F -- "Overlapping Leave" --> H["400: You already have leave on these dates"]
    F -- Pass --> I["Create Leave Request (status: pending)"]
    I --> J["Deduct from pending balance"]
    J --> K["Determine Approval Chain"]
    
    K --> L{"Leave Days > threshold?"}
    L -- "<= 3 days" --> M["Single Approver: Direct Manager"]
    L -- "> 3 days" --> N["Multi-Level: Manager → HR"]
    
    M --> O["Notify Manager"]
    N --> O
    
    O --> P{"Manager Action"}
    P -- Approve --> Q["Update status: approved"]
    P -- Reject --> R["Update status: rejected"]
    R --> S["Restore leave balance"]
    
    Q --> T{"Needs more approvals?"}
    T -- Yes --> U["Notify next approver"]
    U --> P
    T -- No --> V["Final Approval"]
    V --> W["Deduct from used balance"]
    W --> X["Mark attendance dates as 'on_leave'"]
    X --> Y["Notify Employee: Leave Approved"]
    
    S --> Z["Notify Employee: Leave Rejected"]
```

### 8.3 Employee Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Onboarding: Offer Accepted
    Onboarding --> Probation: Onboarding Complete
    Probation --> Active: Probation Confirmed
    Probation --> Terminated: Probation Failed
    Active --> OnNotice: Resignation Submitted
    Active --> Terminated: Terminated by HR
    Active --> Retired: Retirement Age
    OnNotice --> Resigned: Notice Period Complete
    OnNotice --> Active: Resignation Withdrawn
    Resigned --> [*]
    Terminated --> [*]
    Retired --> [*]

    note right of Onboarding
        Triggers: Welcome email,
        IT setup, Buddy assignment
    end note

    note right of Terminated
        Triggers: Revoke access,
        Final settlement,
        Asset collection
    end note

    note right of Resigned
        Triggers: Experience letter,
        Full & final settlement
    end note
```

---

## 9. Real-Time System (Serverless Notifications)

In a serverless environment (like Vercel), persistent stateful WebSockets are not natively supported due to short-lived execution limits. To achieve immediate real-time notifications efficiently and cost-effectively, we leverage a dual strategy:

1. **Pusher (Free Tier):** A fully managed WebSockets service with a generous free tier (200k messages/day, 100 concurrent connections).
2. **TanStack Query Active Refetching (Fallback/Alternative):** Setting `refetchInterval: 30000` (every 30s) for background polling of notification lists, maintaining sync with extremely low load.

### 9.1 Real-Time Flow

```mermaid
graph LR
    subgraph "Event Producers"
        API["Next.js Route Handler"]
        Inngest["Inngest Workers"]
    end

    subgraph "Real-Time Push Service"
        Pusher["Pusher Channels (Free Tier)"]
    end

    subgraph "Clients"
        Browser1["Browser 1 (Pusher Client)"]
        Browser2["Browser 2 (Pusher Client)"]
    end

    API -->|"1. Trigger Pusher Event (REST)"| Pusher
    Inngest -->|"1. Trigger Pusher Event (REST)"| Pusher

    Pusher -->|"2. Broadcast (WebSockets)"| Browser1
    Pusher -->|"2. Broadcast (WebSockets)"| Browser2
```

### 9.2 Event Types & Channels

- **Channel Structure:** `private-org-{orgId}` for tenant-isolated notifications, and `private-user-{userId}` for personal alerts.

| Event | Target | Priority | Description |
|-------|--------|----------|-------------|
| `leave.applied` | Manager | High | Notify manager of new request |
| `leave.approved` | Employee | High | Notify employee their leave is approved |
| `leave.rejected` | Employee | High | Notify employee their leave was rejected |
| `payroll.processed` | All | Medium | Notify all employees that payslips are ready |
| `review.due` | Employee | High | Reminder to submit self-assessment |
| `ticket.assigned` | Assignee | Medium | Support ticket assigned to HR staff |

---

## 10. File Storage & Document Management

For an interview/portfolio project, rather than setting up AWS S3 credentials and incurring costs, we use **Uploadthing** or **Cloudinary (Free Tier)**. Uploadthing offers a zero-config, developer-focused, type-safe upload experience for Next.js with a generous 2GB free tier.

### 10.1 Uploadthing Architecture

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as Next.js API Route
    participant UT as Uploadthing Service
    participant MongoDB

    User->>Browser: Select file (max 10MB)
    Browser->>UT: Upload file directly (UT helper)
    UT-->>Browser: File URL & File Key
    Browser->>API: POST /api/v1/documents/confirm
    Note over API: { fileUrl, key, employeeId, category, name }
    API->>MongoDB: Insert document record (orgId scoped)
    API-->>Browser: 201 { document }
```

### 10.2 Directory Mapping (Logical Paths in Database)

Since files are hosted with randomized safe hashes in Uploadthing, database documents track logical file structures:
- `/{orgId}/employees/{employeeId}/profile-photo.jpg`
- `/{orgId}/employees/{employeeId}/id-proofs/aadhaar.pdf`
- `/{orgId}/policies/employee_handbook.pdf`
- `/{orgId}/recruitment/{applicantId}/resume.pdf`

### 10.3 Document Security

- **Temporary Upload Tokens:** Generated and validated dynamically by Uploadthing.
- **Client Access Restrictions:** Dynamic routing restricts document retrieval. Standard employee accounts can only request links to their own documents; HR Admins have organizational clearance.
- **Encryption:** Sensitive values (e.g., direct field references to PAN or bank routing numbers) are encrypted in the MongoDB document using Node's standard `crypto` module (AES-256-GCM) with a local server secret.

---

## 11. Payroll Processing Pipeline

To process multi-employee payroll calculations asynchronously without long-running servers, we use **Inngest (Free Tier)**. Inngest enables event-driven background functions that execute seamlessly on Vercel Serverless, handling retries, delays, and state step-by-step.

### 11.1 Pipeline Architecture

```mermaid
flowchart TD
    A["HR Triggers Payroll Run"] --> B["Next.js Route: POST /api/v1/payroll/process"]
    B --> C["1. Create Payroll Run document (status: processing)"]
    C --> D["2. Send Event 'payroll/run.triggered' to Inngest"]
    D --> E["API returns 202 accepted (Instant UI release)"]
    
    subgraph Inngest Cloud / Vercel Serverless
        F["Inngest worker picks up event"]
        F --> G["Fetch all Active Employees"]
        G --> H["Process Batch (chunk size: 50)"]
        H --> I["For each chunk: Calculate Salary, Deductions & Taxes"]
        I --> J["Generate PDF Payslip via @react-pdf"]
        J --> K["Upload PDF to Uploadthing"]
        K --> L["Save Payroll record to MongoDB"]
    end

    L --> M{"More Chunks?"}
    M -- Yes --> H
    M -- No --> N["Update Run Status: processed"]
    N --> O["Emit: payroll.processed event"]
    O --> P["Trigger Pusher real-time UI notification"]
    O --> Q["Send email alerts to employees (SendGrid)"]
```

### 11.2 Payroll Calculation Formula

```
GROSS PAY:
  Basic = CTC × BasicPercentage (e.g., 40%)
  HRA = Basic × HRAPercentage (e.g., 50%)
  Special Allowance = CTC - Basic - HRA - Employer PF
  
  Gross = Basic + HRA + Special Allowance + Overtime Pay + Reimbursements

DEDUCTIONS:
  PF (Employee) = min(Basic × 12%, ₹21,600/year)
  ESI = Gross × 0.75% (only if Gross < ₹21,000/month)
  Professional Tax = Slab-based (varies by state)
  TDS = (Projected Annual Income - Exemptions - Deductions) × Tax Slab Rate / 12

  LOP Deduction = (Gross / Working Days) × LOP Days

NET PAY:
  Net = Gross - PF - ESI - PT - TDS - LOP Deduction - Other Deductions
```

### 11.3 Idempotency & Safety

- Payroll for a given `(orgId, month)` can only be run once. Re-runs require explicit "reprocess" action.
- Each payroll record has a `runId` linking it to the batch.
- Failed individual calculations don't stop the entire batch — they're flagged with `status: error` and HR is notified.
- Payroll runs are logged in `audit_logs` with full before/after for compliance.

---

## 12. Search & Filtering Architecture

### 12.1 MongoDB Atlas Search

For employee directory search, we use **MongoDB Atlas Search** (built on Apache Lucene) instead of a separate Elasticsearch cluster. This reduces operational complexity.

```mermaid
graph TD
    A["User Types in Search Bar"] --> B["TanStack Query: debounce 300ms"]
    B --> C["useQuery: GET /api/v1/employees/search?q=alice"]
    C --> D["API Server"]
    D --> E{"Search Type?"}
    
    E -- "Simple text" --> F["MongoDB Atlas Search"]
    E -- "Structured filter" --> G["Standard MongoDB Query"]
    
    F --> H["Atlas Search Index"]
    H --> I["Full-text match on: firstName, lastName, email, employeeId, designation"]
    I --> J["Fuzzy matching enabled (typo tolerance)"]
    J --> K["Return scored results"]

    G --> L["Compound query with indexes"]
    L --> M["Filter by: department, status, branch, employment type"]
    M --> K

    K --> N["API Response with pagination"]
    N --> O["TanStack Query: cache results automatically"]
    O --> P["UI: Render search results"]
```

### 12.2 Atlas Search Index Definition

```json
{
  "name": "employee_search",
  "analyzer": "lucene.standard",
  "mappings": {
    "dynamic": false,
    "fields": {
      "personalInfo.firstName": { "type": "string", "analyzer": "lucene.standard" },
      "personalInfo.lastName": { "type": "string", "analyzer": "lucene.standard" },
      "personalInfo.email": { "type": "string", "analyzer": "lucene.keyword" },
      "employeeId": { "type": "string", "analyzer": "lucene.keyword" },
      "employmentInfo.designation": { "type": "string", "analyzer": "lucene.standard" },
      "employmentInfo.status": { "type": "string", "analyzer": "lucene.keyword" },
      "employmentInfo.departmentId": { "type": "objectId" },
      "employmentInfo.branchId": { "type": "objectId" },
      "orgId": { "type": "objectId" }
    }
  }
}
```

---

## 13. Caching Strategy

### 13.1 Cache Layers

```mermaid
graph TD
    Request["Incoming Request"] --> L1{"TanStack Query Cache (Client)"}
    L1 -- Hit --> ClientResponse["Instant Response (0ms)"]
    L1 -- Miss --> L2{"Redis Cache (Server)"}
    L2 -- Hit --> ServerResponse["Fast Response (~5ms)"]
    L2 -- Miss --> L3["MongoDB Query (~20-100ms)"]
    L3 --> PopulateRedis["Populate Redis Cache"]
    PopulateRedis --> PopulateRTK["Response → TanStack Query Cache"]
    PopulateRTK --> FinalResponse["Response to Client"]
```

### 13.2 What Gets Cached

| Data | Cache Location | TTL | Invalidation Strategy |
|------|---------------|-----|----------------------|
| Organization settings | Redis + TanStack Query | 1 hour | On settings update |
| Employee list (paginated) | TanStack Query | 5 min | queryKey invalidation |
| Employee profile | TanStack Query | 5 min | On profile update (mutation + invalidation) |
| Leave balances | Redis | 10 min | On leave request/approval |
| Today's attendance | Redis | 30 sec | On clock-in/out |
| Department list | Redis + TanStack Query | 1 hour | On CRUD |
| Notification count | Redis | Real-time | WebSocket push |
| RBAC permissions | Redis | 15 min | On role change |
| Dashboard metrics | Redis | 5 min | On payroll run / hire / termination |

### 13.3 Redis Key Naming Convention

```
ems:{orgId}:org:settings                    → Organization settings
ems:{orgId}:emp:{empId}:profile             → Employee profile
ems:{orgId}:emp:{empId}:leave:balances      → Leave balances
ems:{orgId}:attendance:{date}:summary       → Daily attendance summary
ems:{orgId}:user:{userId}:permissions       → RBAC permissions
ems:{orgId}:user:{userId}:notif:unread      → Unread notification count
ems:{orgId}:dashboard:metrics               → Dashboard KPIs
ems:rate:{ip}:{endpoint}                    → Rate limiting counters
```

---

## 14. Background Jobs & Task Queues

### 14.1 Serverless Job Architecture (Inngest)

Inngest handles asynchronous workflows by coordinating step-by-step executions of serverless API handlers. When an event is triggered, Inngest triggers Next.js routes, managing retries, step dependencies, and execution state completely for free.

```mermaid
graph TD
    subgraph "Inngest Orchestration"
        Cloud["Inngest Cloud (Free Tier)"]
    end

    subgraph "Next.js Route Handlers (Vercel)"
        API["/api/inngest Endpoint"]
        F1["Job: Process Payroll Chunk"]
        F2["Job: Send Email Alerts"]
        F3["Job: Daily Cron Routines"]
    end

    Cloud -->|"HTTP Event Callbacks"| API
    API --> F1
    API --> F2
    API --> F3
```

### 14.2 Serverless Job Catalog

| Event | Job | Trigger | Concurrency | Retry |
|-------|-----|---------|-------------|-------|
| `payroll/run.triggered` | Process salary calculation chunks | On-demand (HR) | 1 (per org) | 3x with backoff |
| `notification/email.send` | Dispatch transactional emails | Real-time | 5 | 5x with exponential backoff |
| `cron/leave.accrue` | Allocate leave balances | Monthly Cron | 1 | 3x |
| `cron/daily.routines` | Check probation status & document expiries | Daily Cron (6 AM) | 1 | 1x |

---

## 15. Security Architecture

### 15.1 Security Layers

```mermaid
graph TD
    subgraph "Perimeter & Network"
        VercelFirewall["Vercel Edge Firewall & DDoS Protection"]
    end
    
    subgraph "Application"
        NextHeaders["Next.js Security Headers (CSP, HSTS)"]
        CORS["CORS (Origin validation)"]
        RateLimit["Rate Limiting (Upstash Redis)"]
        InputVal["Input Validation (Zod)"]
        SQLInj["NoSQL Injection Prevention (Mongoose)"]
    end
    
    subgraph "Authentication"
        JWT["JWT (short-lived, signed)"]
        MFA["MFA (TOTP)"]
        Bcrypt["bcrypt (password hashing)"]
        Sessions["Session Management (Upstash Redis)"]
    end
    
    subgraph "Authorization"
        RBAC["Role-Based Access Control"]
        FieldPerm["Field-Level Permissions"]
        TenantIso["Tenant Isolation (orgId)"]
    end
    
    subgraph "Data Protection"
        TLS["TLS 1.3 (in transit)"]
        AES["AES-256-GCM (at rest in MongoDB)"]
        CryptoSecret["Local Symmetric Key (Env Secret)"]
        FieldEnc["Field-Level Encryption (PII via Node.js crypto)"]
    end

    VercelFirewall --> NextHeaders
    NextHeaders --> CORS
    CORS --> RateLimit
    RateLimit --> InputVal
    InputVal --> SQLInj
    SQLInj --> JWT
    JWT --> MFA
    MFA --> RBAC
    RBAC --> FieldPerm
    FieldPerm --> TenantIso
    TenantIso --> TLS
    TLS --> AES
    AES --> CryptoSecret
    CryptoSecret --> FieldEnc
```

### 15.2 Sensitive Data Handling

| Data | Storage | Encryption Method | Access Control |
|------|---------|-------------------|----------------|
| Passwords | MongoDB (hashed) | bcrypt (12 rounds) | Never returned in API |
| MFA secrets | MongoDB (encrypted) | Node.js `crypto` (AES-256-GCM) | Auth service only |
| Bank details | MongoDB (encrypted) | Node.js `crypto` (AES-256-GCM) | Finance + HR Admin |
| PAN / SSN | MongoDB (encrypted) | Node.js `crypto` (AES-256-GCM) | HR Admin only |
| Aadhaar / ID proofs | Uploadthing (Private) | Native Uploadthing tokens | HR Admin + Self |
| Payslips | Uploadthing (Private) | Native Uploadthing tokens | Employee + HR Admin |
| JWT tokens | HTTP-only cookies | Signed (HS256) | Not accessible via client-side JS |
| Audit logs | MongoDB (append-only) | Database-level encryption | Super Admin only |

### 15.3 OWASP Top 10 Mitigations

| Threat | Mitigation |
|--------|-----------|
| Injection | Mongoose parameterized queries, Zod input validation |
| Broken Auth | JWT + MFA + Upstash Redis session management + account lockout |
| Sensitive Data Exposure | Field-level encryption via Node.js standard `crypto`, TLS, redacted API responses |
| XML External Entities | JSON-only API (no XML parsing) |
| Broken Access Control | RBAC middleware on every Next.js API endpoint, orgId enforcement |
| Security Misconfiguration | Next.js security headers, CSP, HSTS, no default credentials |
| XSS | React auto-escaping, CSP headers, sanitize user input |
| Using Components with Vulnerabilities | Dependabot, `npm audit` in CI/CD |
| Insufficient Logging | Audit log on every mutation, standard serverless stdout logs |

### 15.4 Secure Tenant Impersonation Architecture

Tenant impersonation is a highly sensitive action that requires strict cryptographic controls and continuous observability:

1. **Short-Lived Tokens:**
   - Impersonation tokens are issued with a maximum lifetime of **15 minutes** and cannot be refreshed.
   - The token contains cryptographic claims identifying both the active virtual user (Tenant Admin role) and the originating Platform Admin (`impersonatorId`).

2. **Strict Cryptographic Handshake:**
   - Platform admins must re-authenticate (provide their password and MFA code) before an impersonation session is initialized.
   - The server signs the impersonation JWT with a unique platform key separate from the tenant JWT secret.

3. **Immutable Platform Audit Logging:**
   - The platform admin's real identity is attached to every incoming HTTP request payload by the authentication gateway.
   - Every single database mutation performed during impersonation is logged in the `platform_audit_logs` collection. This record is immutable and write-once, preventing anyone (including the platform admin themselves) from erasing the history of their actions while in the tenant's workspace.

---

## 16. Scalability & Performance

### 16.1 Serverless Auto-Scaling Strategy

Instead of complex container orchestration (Docker/ECS) and load balancers, the system is designed to scale dynamically using **Vercel Serverless Auto-Scaling**. 

```mermaid
graph TD
    Browser["User Browser"] --> VercelEdge["Vercel Edge Network"]
    
    subgraph "Serverless Scale-to-Zero"
        VercelEdge --> S1["Serverless Invocation 1"]
        VercelEdge --> S2["Serverless Invocation 2"]
        VercelEdge --> SN["Serverless Invocation N (Concurrent)"]
    end

    subgraph "SaaS Shared Data Tier"
        S1 --> MongoDB["MongoDB Atlas (Free M0)"]
        S2 --> MongoDB
        SN --> MongoDB
        S1 --> Redis["Upstash Redis (Serverless Cache)"]
    end
```

### 16.2 Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| API Response (P50) | < 80ms | Upstash Redis caching, dynamic edge routes |
| API Response (P95) | < 250ms | Mongoose index optimization, projection filtering |
| Time to First Byte | < 150ms | Next.js Server Components, Edge network cache |
| Employee Search | < 150ms | Regex indexing on M0, debounce in TanStack Query |
| Payroll Processing | < 1min / 100 employees | Parallel serverless chunking via Inngest |
| Dashboard Load | < 1.5s | Next.js pre-rendered layouts + optimistic client UI |
| Notification Latency | < 100ms | Pusher instant WebSocket broadcast |

### 16.3 Serverless MongoDB & Cache Optimization

- **Connection Pool Control:** Serverless functions are stateless, meaning a new database connection can be established on every request. To prevent exhausting MongoDB Atlas M0 limits, we reuse the database connection across serverless invocations using a global cached connection wrapper in Mongoose.
- **Upstash Redis Caching:** Serves as a global serverless session store and rate-limiter, automatically scaling to zero and keeping latency under 5ms.

---

## 17. Deployment Architecture

### 17.1 Infrastructure Topology

Our deployment model relies entirely on **Vercel GitHub Integration**, creating a zero-maintenance, zero-cost production pipeline.

```mermaid
graph LR
    Dev["Developer Push"] --> GitHub["GitHub Repository"]
    GitHub -->|Trigger webhook| Vercel["Vercel Build Engine"]
    
    subgraph "Vercel Hosted Environments"
        Vercel -->|Deploy main branch| Prod["Production Build (*.vercel.app)"]
        Vercel -->|Deploy feature branches| Preview["Preview Deployments"]
    end

    Prod --> DB["MongoDB Atlas M0 Cluster"]
    Prod --> Redis["Upstash Redis"]
    Prod --> Uploadthing["Uploadthing"]
```

### 17.2 Environment Strategy

| Environment | Purpose | Infrastructure Stack |
|------------|---------|---------------------|
| `local` | Active feature coding and local testing | Local React/Next.js (`npm run dev`), Local MongoDB, Upstash |
| `staging` | Automated QA & UI reviews per pull request | Vercel Git-integrated Preview deployments + Mock Data |
| `production` | Live showcase portfolio and reviewer inspections | Vercel Production deployment + MongoDB Atlas M0 cluster |

### 17.3 CI/CD Workflow

Vercel automates the deployment cycle on every commit. The pipeline is structured as:
1. **GitHub Push:** Triggers automated Vercel builder.
2. **Linter & Type Check:** Vercel runs `npm run lint` and checks TypeScript types.
3. **Build Target Compilation:** Compiles pages, server components, and API routes.
4. **Instant Preview URL:** Provides a dedicated, shareable, isolated staging URL for feedback.
5. **Production Promotion:** Merging to the `main` branch immediately redeploys the live application.

---

## 18. Monitoring, Logging & Observability

Observability is kept simple and cost-free, leveraging integrated serverless platform dashboards:
- **Vercel Logs (Console Logging):** Serves as our primary logging collector. All `console.error` and `console.log` statements are captured and searchable in real time via the Vercel deployment logs portal.
- **Vercel Speed Insights:** Free performance telemetry tracking Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Core Web Vitals directly from actual user sessions.
- **MongoDB Atlas Profiler:** Integrated query analysis dashboard to spot and optimize slow-running database operations.

---

## 19. Disaster Recovery & Backup

- **Database Backups:** MongoDB Atlas M0 Free Tier provides automated, continuous data protection with basic disaster recovery, ensuring operational consistency for our showcase.
- **Asset Versioning:** Uploadthing manages logical key pointers for document storage, ensuring safe upload records.
- **Code Integrity:** Fully backed up inside GitHub; deployments can be rolled back to any previous git commit instantly via Vercel with a single click.

---

## 20. Cost Estimation (100% Free-Tier Infrastructure)

This SAAS platform has been architected to run entirely on **$0/month**, making it perfect for portfolio demonstrations and technical interview reviews.

| Service | Tier / Plan | Spec Limits | Monthly Cost |
|---------|-------------|-------------|--------------|
| **Vercel** | Hobby Plan | 100GB Bandwidth, unlimited serverless execution | **$0** |
| **MongoDB Atlas** | M0 Shared Cluster | 512MB storage, includes Vector Search | **$0** |
| **Upstash Redis** | Serverless Free | 10,000 commands per day | **$0** |
| **Uploadthing** | Free Tier | 2 GB document and image storage | **$0** |
| **Pusher** | Sandbox Plan | 200,000 notifications per day, 100 concurrent | **$0** |
| **SendGrid** | Free Plan | 100 outgoing transactional emails per day | **$0** |
| **Inngest** | Dev / Free | 50,000 job runs/events per month | **$0** |
| **OpenAI API** | Pay-as-you-go | Dynamic (approx. $1-2 total during active showcase reviews) | **<$2.00** |
| **Total** | | **Showcase Hosting Cost** | **$0.00/month** |

---nth
## 21. AI Architecture & Integration

### 21.1 AI Pipeline Architecture

To ensure the main API remains fast, all heavy AI workloads (embedding generation, summarization) are processed asynchronously via **Inngest serverless background events**.

```mermaid
graph TD
    subgraph "Client"
        UI["React UI (Chatbot / Dashboard)"]
    end

    subgraph "API Layer"
        API["Next.js API Route Handlers"]
    end

    subgraph "Serverless Queue (Inngest)"
        Inngest["Inngest Cloud / Event Handler"]
    end

    subgraph "AI Providers"
        OpenAI["OpenAI API"]
    end

    subgraph "Data Layer"
        VectorDB["MongoDB Atlas Vector Search"]
    end

    UI -- "1. Upload Resume" --> API
    API -- "2. Send Event 'recruitment/resume.uploaded'" --> Inngest
    Inngest -- "3. Trigger Handler Step" --> API
    API -- "4. Generate Text Embedding" --> OpenAI
    OpenAI -- "5. Return Vector Array" --> API
    API -- "6. Save Vector to Doc" --> VectorDB

    UI -- "A. Ask Policy Chatbot" --> API
    API -- "B. Vector Search" --> VectorDB
    VectorDB -- "C. Return Context Paragraphs" --> API
    API -- "D. Streaming Chat Req" --> OpenAI
    OpenAI -- "E. Stream Tokens" --> API
    API -- "F. Stream Response" --> UI
```

### 21.2 Core AI Capabilities

| Feature | Tech Stack | Execution Model | Description |
|---------|------------|----------------|-------------|
| **Policy Chatbot** | Vercel AI SDK, MongoDB Vector Search, GPT-4o-mini | Synchronous (Streaming) | RAG pipeline that searches company handbooks and streams natural language answers to employees. |
| **Smart ATS** | OpenAI `text-embedding-3-small`, Inngest | Asynchronous (Serverless Event) | Generates semantic vectors for resumes and job descriptions. Sorts applicants by semantic match score. |
| **Performance Summaries** | OpenAI GPT-4o-mini, Inngest | Asynchronous (Serverless Event) | Aggregates peer and manager reviews and generates unbiased executive summaries during review cycles. |
| **Intelligent Routing** | OpenAI GPT-4o-mini, Next.js API Routes | Synchronous | Analyzes Helpdesk ticket descriptions to automatically determine category, priority, and assigned department. |

---

## Appendix A: MongoDB Connection Configuration

```
Connection URI Format:
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ems_production?retryWrites=true&w=majority

Mongoose Connection Options (Optimized for Atlas M0 Free Tier & Vercel Serverless):
{
  maxPoolSize: 10,                       // Low pool size to prevent exceeding 500 conn limit on Atlas M0
  minPoolSize: 1,                        // Minimal pool for cold starts
  maxIdleTimeMS: 15000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  retryWrites: true,
  w: "majority"
}
```

---

## Appendix B: Environment Variables

```
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-portfolio.vercel.app

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ems_production

# Serverless Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# JWT Authentication
JWT_SECRET=your_256_bit_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret

# Uploadthing (File Storage)
UPLOADTHING_SECRET=sk_live_xxx
UPLOADTHING_APP_ID=xxx

# Inngest (Serverless Jobs)
INNGEST_EVENT_KEY=ink_xxx
INNGEST_SIGNING_KEY=sign_xxx

# Pusher Channels (Real-Time Notifications)
PUSHER_APP_ID=xxx
NEXT_PUBLIC_PUSHER_KEY=xxx
PUSHER_SECRET=xxx
NEXT_PUBLIC_PUSHER_CLUSTER=ap2

# SendGrid Email
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@your-portfolio.com

# OpenAI API (AI Copilot)
OPENAI_API_KEY=sk-proj-xxx

# OAuth Credentials
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx
```

---

## 22. SaaS Maker Platform Administration

### 22.1 Overview & Authorization Flow
Platform administration is managed through a segregated portal accessible only to authenticated users from the `platform_admins` collection.

```mermaid
sequenceDiagram
    actor Owner as Platform Owner
    participant UI as Admin Dashboard
    participant API as Next.js API Gateway
    participant Redis as Redis Session Cache
    participant DB as MongoDB Atlas

    Owner->>UI: Enter Credentials & MFA
    UI->>API: POST /api/platform/auth/login
    API->>DB: Query admin email & verify password hash
    DB-->>API: Admin record verified
    API->>API: Sign specialized Platform JWT (exp: 1h)
    API->>Redis: Set platform-session:adminId
    API-->>UI: 200 OK with HttpOnly cookies
    Owner->>UI: View Global SaaS Metrics
    UI->>API: GET /api/platform/metrics
    API->>Redis: Check active session validity
    API->>DB: Query aggregated metrics (Total orgs, MRR, churn)
    DB-->>API: Aggregation results
    API-->>UI: Return global dashboard payloads
```

### 22.2 Tenant Isolation and Impersonation Sequence
Tenant impersonation allows the Platform Owner to temporarily inherit a Tenant Admin's context while preserving the security audit trail.

```mermaid
sequenceDiagram
    actor Owner as Platform Owner
    participant API as Next.js API Gateway
    participant TokenSvc as JWT Service
    participant DB as MongoDB Atlas
    participant Audit as platform_audit_logs

    Owner->>API: POST /api/platform/tenant/impersonate { tenantId }
    API->>API: Validate Platform Owner JWT claims
    API->>DB: Verify target tenant exists and is active
    DB-->>API: Target tenant active
    API->>Audit: Create impersonation entry
    API->>TokenSvc: Generate Tenant Access Token { orgId: target, isImpersonating: true, impersonatorId: platform_admin }
    TokenSvc-->>API: Return Short-Lived Impersonation JWT (15-min)
    API-->>Owner: 200 OK with Impersonation Session
```

### 22.3 Administrative Database Operations
Global write actions are partitioned into strict APIs to enforce complete safety:
- **Tenant Status Operations:** Modifying a tenant's subscription state from `active` to `suspended` instantly invalidates all standard tenant sessions cached in Redis under the `orgId` prefix.
- **Plan Configuration Synchronization:** Feature switches defined in the `subscription_plans` schema are matched with a tenant's billing profile. The multi-tenancy gatekeeper reads this feature mapping to dynamic-route permissions.

---

> **This document is the single source of truth for the EMS architecture.** All implementation decisions should reference this design. Update this document as architecture evolves.
