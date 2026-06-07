# Employee Management System — Feature Specification

> A complete, scalable SAAS platform for businesses of all sizes to manage their workforce end-to-end.

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Organization & Multi-Tenancy](#2-organization--multi-tenancy)
3. [Employee Management (Core)](#3-employee-management-core)
4. [Department & Team Management](#4-department--team-management)
5. [Attendance & Time Tracking](#5-attendance--time-tracking)
6. [Leave Management](#6-leave-management)
7. [Payroll Management](#7-payroll-management)
8. [Performance Management](#8-performance-management)
9. [Recruitment & Onboarding](#9-recruitment--onboarding)
10. [Document Management](#10-document-management)
11. [Notifications & Announcements](#11-notifications--announcements)
12. [Reports & Analytics Dashboard](#12-reports--analytics-dashboard)
13. [Role-Based Access Control (RBAC)](#13-role-based-access-control-rbac)
14. [Settings & Configuration](#14-settings--configuration)
15. [Audit Logs & Compliance](#15-audit-logs--compliance)
16. [Employee Self-Service Portal](#16-employee-self-service-portal)
17. [Integration & API](#17-integration--api)
18. [SaaS Billing Sandbox & Limit Enforcement](#18-saas-billing-sandbox--limit-enforcement)
19. [AI Copilot & Automation](#19-ai-copilot--automation)
20. [SaaS Maker (Platform Owner) Admin Panel](#20-saas-maker-platform-owner-admin-panel)

---

## 1. Authentication & Authorization

### 1.1 User Registration & Login

- **Working:** Users register with email + password or via OAuth providers (Google, Microsoft, GitHub). On first signup, a new organization (tenant) is created and the user becomes the Super Admin.
- **Usage:** Every user must authenticate before accessing any part of the system. JWT tokens (access + refresh) are issued on login and stored securely. Redux Toolkit manages the auth state globally so every component can check `isAuthenticated`, `currentUser`, and `role`.

### 1.2 Multi-Factor Authentication (MFA)

- **Working:** After entering credentials, users are prompted for a second factor — a TOTP code from an authenticator app (Google Authenticator, Authy) or an SMS/email OTP.
- **Usage:** Admins can enforce MFA organization-wide from Settings. This protects against credential theft and is a compliance requirement for many industries (SOC 2, HIPAA).

### 1.3 Password Recovery & Reset

- **Working:** Users click "Forgot Password" → receive a time-limited (15 min) reset link via email → set a new password that must meet complexity rules (min 8 chars, 1 uppercase, 1 number, 1 special char).
- **Usage:** Reduces support tickets and ensures users can self-service their way back into the system without admin intervention.

### 1.4 Session Management

- **Working:** Active sessions are tracked per device. Users can view all active sessions and revoke any session remotely. Idle timeout (configurable: 15/30/60 min) automatically logs out inactive users.
- **Usage:** Critical for security. If an employee loses a device, an admin (or the employee themselves) can kill that session immediately.

---

## 2. Organization & Multi-Tenancy

### 2.1 Tenant Isolation

- **Working:** Each organization's data is completely isolated at the database level (schema-per-tenant or row-level security). One organization can never access another's data.
- **Usage:** This is the foundation of a SAAS product. Businesses sign up and get their own isolated workspace. Redux state includes `currentOrganization` with the tenant ID, which is sent with every API request.

### 2.2 Organization Profile

- **Working:** Admins configure company name, logo, address, industry, timezone, date format, currency, and fiscal year start. This metadata is loaded on login and stored in Redux so the entire UI adapts (e.g., date formatting, currency symbols in payroll).
- **Usage:** Personalizes the experience. A company in India sees ₹ and DD/MM/YYYY; a US company sees $ and MM/DD/YYYY — all from one codebase.

### 2.3 Branch / Location Management

- **Working:** Organizations can define multiple office locations (branches) with addresses, timezones, and local holidays. Employees are assigned to a branch.
- **Usage:** Essential for companies with multiple offices. Attendance policies, holidays, and payroll rules can vary per branch.

---

## 3. Employee Management (Core)

### 3.1 Employee Directory (CRUD)

- **Working:** Full Create, Read, Update, Delete operations on employee records. Each employee has:
  - **Personal Info:** Name, email, phone, date of birth, gender, blood group, emergency contacts, profile photo.
  - **Employment Info:** Employee ID (auto-generated or custom), designation, department, reporting manager, employment type (Full-time, Part-time, Contract, Intern), date of joining, probation period, confirmation date.
  - **Compensation Info:** Base salary, allowances, deductions, bank details, PAN/SSN/Tax ID.
  - **Address Info:** Current address, permanent address.
- **Usage:** This is the heart of the system. Redux Toolkit manages the employee list with `createAsyncThunk` for API calls and `createEntityAdapter` for normalized state. The UI provides a searchable, filterable, sortable table with pagination.

### 3.2 Employee Profile View

- **Working:** Clicking on an employee opens a detailed profile page with tabbed sections: Overview, Documents, Attendance, Leaves, Payroll History, Performance Reviews, Activity Log.
- **Usage:** Gives HR and managers a 360° view of any employee. The profile is built with Redux selectors that derive data from multiple slices (employee, attendance, leave, payroll).

### 3.3 Bulk Operations

- **Working:** Select multiple employees via checkboxes → perform bulk actions: change department, update status (active/inactive), export to CSV/Excel, send bulk email, assign to a project.
- **Usage:** Saves hours of manual work when onboarding a batch of new hires or reorganizing teams. Redux handles the selected IDs in a `selectedEmployees` array in the UI slice.

### 3.4 Employee Search & Filters

- **Working:** A global search bar (in the Topbar) with real-time autocomplete. Advanced filters by: department, designation, employment type, status (active/inactive/on-leave), branch, date of joining range, salary range.
- **Usage:** In a company with 5,000+ employees, finding the right person fast is critical. Redux RTK Query caches search results for instant re-display.

### 3.5 Employee Status Lifecycle

- **Working:** Employees move through statuses: `Onboarding` → `Probation` → `Active` → `On Notice` → `Resigned` / `Terminated` / `Retired`. Each transition is tracked with a timestamp and reason.
- **Usage:** HR can see exactly where each employee is in their lifecycle. Automated workflows can trigger on status changes (e.g., revoke access on termination).

---

## 4. Department & Team Management

### 4.1 Department CRUD

- **Working:** Create departments (Engineering, Marketing, Sales, HR, Finance, etc.) with a department head, description, and budget. Departments can have sub-departments (e.g., Engineering → Frontend, Backend, QA).
- **Usage:** Provides organizational structure. Every employee belongs to a department, which drives reporting hierarchies, leave approval chains, and payroll cost centers.

### 4.2 Team / Project Groups

- **Working:** Cross-departmental teams can be created for specific projects. A team has a name, lead, members, start/end dates, and status (active/completed).
- **Usage:** Modern companies work in cross-functional teams. This feature lets managers track who is on which project without disrupting the formal department hierarchy.

### 4.3 Org Chart Visualization

- **Working:** An interactive, zoomable org chart rendered from the reporting-manager relationships. Clicking a node shows the employee's quick profile. Drag-and-drop to reassign reporting lines.
- **Usage:** Gives leadership a bird's-eye view of the organization. Especially useful during restructuring or when onboarding new executives.

---

## 5. Attendance & Time Tracking

### 5.1 Clock In / Clock Out

- **Working:** Employees click "Clock In" to start their workday and "Clock Out" to end it. The system records timestamps, calculates total hours, and flags overtime (>8 hrs or as configured). Optional: GPS-based clock-in for field employees, IP-restriction for office employees.
- **Usage:** Replaces physical attendance registers and biometric systems. Redux stores today's attendance status in a `todayAttendance` slice so the dashboard shows real-time "Who's in?" data.

### 5.2 Attendance Calendar

- **Working:** A month-view calendar per employee showing: Present (green), Absent (red), Half-day (yellow), Leave (blue), Holiday (grey), Weekend (light grey). Admins can manually override entries.
- **Usage:** Visual representation makes it easy to spot patterns (e.g., frequent Monday absences). Managers review this during performance discussions.

### 5.3 Shift Management

- **Working:** Define shifts (Morning: 6AM–2PM, General: 9AM–6PM, Night: 10PM–6AM) with break durations. Assign employees to shifts on a weekly/monthly roster. Shift swaps between employees with manager approval.
- **Usage:** Essential for manufacturing, healthcare, hospitality, and BPO industries where employees work in rotating shifts.

### 5.4 Overtime Tracking & Policies

- **Working:** Overtime is auto-calculated based on shift duration vs. actual hours worked. Configurable rules: 1.5x pay after 8 hrs, 2x pay on holidays. Overtime requests can require pre-approval.
- **Usage:** Ensures legal compliance with labor laws (many countries mandate overtime pay) and helps control labor costs.

### 5.5 Timesheet Management

- **Working:** Employees log hours against projects/tasks on a weekly timesheet. Managers approve timesheets. Approved timesheets feed into payroll for accurate billing and compensation.
- **Usage:** Critical for consulting firms, agencies, and any business that bills clients by the hour.

---

## 6. Leave Management

### 6.1 Leave Types & Policies

- **Working:** Admins define leave types: Casual Leave (CL), Sick Leave (SL), Earned Leave (EL), Maternity/Paternity Leave, Comp-Off, Loss of Pay (LOP), Work From Home (WFH). Each type has: annual quota, carry-forward rules, encashment rules, accrual frequency (monthly/quarterly/yearly), probation eligibility, gender applicability.
- **Usage:** Every country and company has different leave policies. This configurability ensures the system works for a 10-person startup in Berlin and a 10,000-person enterprise in Mumbai.

### 6.2 Leave Application & Approval Workflow

- **Working:** Employee selects leave type → picks date range → adds reason → submits. The request goes to the reporting manager (or a custom approval chain: Manager → HR → Director for >5 days). Approver gets a notification, reviews the team calendar for conflicts, and approves/rejects with comments.
- **Usage:** Eliminates email/Slack-based leave requests. Redux manages the leave request lifecycle: `pending` → `approved` / `rejected` / `cancelled`. The UI shows pending requests with a badge count.

### 6.3 Leave Balance Dashboard

- **Working:** Each employee sees a card-based dashboard showing: total allocated, used, pending approval, and remaining balance for each leave type. A progress bar visualizes usage.
- **Usage:** Employees plan their time off proactively. No more "How many leaves do I have left?" messages to HR.

### 6.4 Holiday Calendar

- **Working:** Admins configure public holidays per branch/location. Employees see a unified calendar with holidays, their approved leaves, and team members' leaves (for coordination).
- **Usage:** Prevents scheduling conflicts. A team lead can see that 3 out of 5 team members are off next Friday and plan accordingly.

### 6.5 Comp-Off & Restricted Holidays

- **Working:** If an employee works on a holiday, they can request a Comp-Off (compensatory off) for another day. Restricted holidays are a pool from which employees can pick a subset (e.g., choose any 3 out of 10 regional festivals).
- **Usage:** Provides flexibility in diverse, multi-cultural teams where not everyone celebrates the same holidays.

---

## 7. Payroll Management

### 7.1 Salary Structure Configuration

- **Working:** Define salary components: Basic Pay, HRA, Conveyance Allowance, Special Allowance, Medical Allowance, PF (Provident Fund), ESI, Professional Tax, TDS (Tax Deducted at Source), custom deductions. Each component can be a fixed amount or a percentage of Basic Pay.
- **Usage:** Different countries and companies have different salary structures. This module lets admins build any structure. Redux stores the salary template, and individual employee salary is derived from it.

### 7.2 Payroll Processing

- **Working:** At month-end, HR triggers payroll processing. The system:
  1. Fetches attendance data (working days, LOP days, overtime hours).
  2. Applies salary components and calculates gross pay.
  3. Deducts statutory contributions (PF, ESI, tax).
  4. Adds reimbursements and bonuses.
  5. Calculates net pay.
  6. Generates payslips (PDF).
  7. Initiates bank transfer file (if integrated).
- **Usage:** Automates the most error-prone and time-consuming HR task. A 500-employee payroll that took 3 days manually now completes in minutes.

### 7.3 Payslip Generation & History

- **Working:** Each employee gets a downloadable PDF payslip with a detailed breakdown. Historical payslips are accessible from the employee profile (Employee Self-Service). The system retains payslip data for 7+ years for compliance.
- **Usage:** Employees need payslips for loan applications, tax filing, and personal records. Storing them centrally eliminates "Can you resend my March payslip?" requests.

### 7.4 Tax Management

- **Working:** Employees declare their tax-saving investments (e.g., 80C, 80D in India; 401k in USA) at the start of the fiscal year. The system calculates monthly TDS based on declarations, adjusting as declarations are updated. At year-end, generates Form 16 / W-2 equivalents.
- **Usage:** Ensures employees pay the right amount of tax throughout the year, avoiding large deductions in March or April.

### 7.5 Reimbursements & Expense Claims

- **Working:** Employees submit expense claims (travel, meals, equipment) with receipts (uploaded images/PDFs). Claims go through an approval workflow. Approved claims are added to the next payroll cycle.
- **Usage:** Streamlines expense management. No more collecting paper receipts and filling Excel sheets.

---

## 8. Performance Management

### 8.1 Goal Setting (OKRs / KPIs)

- **Working:** Managers and employees collaboratively set goals at the start of a review cycle (quarterly/half-yearly/yearly). Goals have: title, description, measurable target, weight (importance), deadline, and status (Not Started / In Progress / Completed / Overdue).
- **Usage:** Aligns individual work with company objectives. Redux stores goals in a `performanceSlice` with nested goal objects per employee.

### 8.2 Performance Review Cycles

- **Working:** Admins configure review cycles (e.g., "H1 2026 Review" from Jan–Jun). During the review window:
  1. Employee writes a self-assessment.
  2. Peers submit 360° feedback (optional, configurable).
  3. Manager rates the employee on each goal + competencies.
  4. Manager and employee have a 1-on-1 review meeting.
  5. Final rating is assigned (Exceeds Expectations / Meets / Needs Improvement / Below Expectations).
  6. HR calibrates ratings across departments for fairness.
- **Usage:** Replaces ad-hoc, biased reviews with a structured, fair process. Historical reviews are stored for career progression tracking.

### 8.3 360° Feedback

- **Working:** During a review cycle, the system allows collecting feedback from multiple sources: self, manager, peers (nominated or auto-selected), and direct reports. Feedback can be anonymous. The system aggregates scores and presents a radar chart of competencies.
- **Usage:** Provides a holistic view of performance. An employee might excel technically but struggle with communication — 360° feedback surfaces this.

### 8.4 Continuous Feedback & Recognition

- **Working:** Outside of formal review cycles, any employee can give "kudos" or constructive feedback to any other employee. Kudos are visible on the recipient's profile and in a company-wide feed. Managers can endorse skills.
- **Usage:** Fosters a culture of recognition and real-time feedback rather than waiting 6 months for a formal review.

### 8.5 Performance Improvement Plans (PIPs)

- **Working:** For underperforming employees, managers can initiate a PIP with: specific improvement areas, measurable targets, timeline (30/60/90 days), check-in frequency, and consequences. Progress is tracked with regular check-ins.
- **Usage:** Provides a documented, fair process before termination. Protects the company legally and gives the employee a clear path to improvement.

---

## 9. Recruitment & Onboarding

### 9.1 Job Posting & Applicant Tracking (ATS)

- **Working:** HR creates job postings with: title, department, location, description, requirements, salary range, and employment type. Postings can be published to the company careers page and external job boards (via integrations). Applicants are tracked through stages: Applied → Screening → Interview → Offer → Hired / Rejected.
- **Usage:** Centralizes hiring. Redux manages a `recruitmentSlice` with job postings and a kanban-style applicant pipeline.

### 9.2 Interview Scheduling

- **Working:** HR or hiring managers schedule interviews with calendar integration (Google Calendar / Outlook). Interviewers receive calendar invites with candidate details and a feedback form link. After the interview, they submit structured feedback (scorecards with predefined criteria).
- **Usage:** Eliminates back-and-forth emails for scheduling. Structured feedback ensures consistent evaluation across candidates.

### 9.3 Offer Management

- **Working:** Generate offer letters from templates (with placeholders for name, designation, salary, joining date). Send offers via email with e-signature support. Track offer status: Sent → Viewed → Accepted / Declined / Negotiating.
- **Usage:** Speeds up the offer process. A candidate who receives a professional, fast offer is more likely to accept.

### 9.4 Employee Onboarding Workflow

- **Working:** When a candidate accepts an offer and their status changes to "Hired," an onboarding checklist is auto-generated:
  - [ ] Send welcome email with first-day instructions
  - [ ] Create company email account
  - [ ] Assign laptop and equipment
  - [ ] Set up access to tools (Slack, Jira, GitHub, etc.)
  - [ ] Assign a buddy/mentor
  - [ ] Schedule orientation sessions
  - [ ] Collect identity documents and bank details
  - [ ] Add to payroll
  Each task is assigned to a responsible person (IT, HR, Manager) with a due date. Progress is tracked on a dashboard.
- **Usage:** Ensures no step is missed. A smooth onboarding experience significantly improves new-hire retention.

### 9.5 Offboarding Workflow

- **Working:** When an employee resigns or is terminated, an offboarding checklist is triggered:
  - [ ] Conduct exit interview
  - [ ] Collect company assets (laptop, ID card, etc.)
  - [ ] Revoke system access
  - [ ] Process final settlement (remaining salary, leave encashment, gratuity)
  - [ ] Generate experience/relieving letter
  - [ ] Archive employee data
- **Usage:** Protects company assets and data. Ensures legal obligations (final pay) are met on time.

---

## 10. Document Management

### 10.1 Employee Document Storage

- **Working:** Each employee has a secure document vault where they (or HR) can upload: ID proofs (Aadhaar, Passport, Driver's License), educational certificates, offer letter, appointment letter, NDA, tax declarations, medical reports. Documents are categorized, version-controlled, and encrypted at rest.
- **Usage:** Eliminates physical file cabinets. During audits, HR can pull up any document in seconds.

### 10.2 Company Policy Documents

- **Working:** HR uploads company-wide documents: Employee Handbook, Code of Conduct, IT Security Policy, Anti-Harassment Policy, etc. Employees must acknowledge (e-sign) that they've read critical policies. The system tracks who has and hasn't acknowledged.
- **Usage:** Ensures compliance and protects the company in disputes ("The employee was informed of the policy on X date").

### 10.3 Letter & Template Management

- **Working:** Admins create letter templates with dynamic placeholders: Offer Letter, Appointment Letter, Salary Revision Letter, Warning Letter, Termination Letter, Experience Letter, Relieving Letter. Generate any letter for an employee with one click — placeholders are auto-filled from employee data.
- **Usage:** Standardizes communication. A salary revision letter for 200 employees can be generated in bulk in minutes.

---

## 11. Notifications & Announcements

### 11.1 In-App Notification Center

- **Working:** A bell icon in the Topbar shows unread notification count. Clicking it opens a dropdown with recent notifications: leave approvals, payroll processed, new announcements, task assignments, review reminders. Notifications are categorized (HR, Performance, Attendance, System) and can be marked as read or archived.
- **Usage:** Keeps users informed without relying on email. Redux manages a `notificationSlice` with real-time updates via WebSockets.

### 11.2 Email & Push Notifications

- **Working:** Critical events trigger email notifications: leave approved/rejected, payslip generated, performance review due, birthday/work anniversary. Push notifications (browser + mobile) for urgent items. Users can configure notification preferences (which channels for which events).
- **Usage:** Ensures important information reaches the user even when they're not actively using the app.

### 11.3 Company Announcements & News Feed

- **Working:** Admins can post company-wide announcements (e.g., "Office closed for fumigation on Friday," "Welcome our new VP of Engineering"). Announcements appear on the dashboard and can be pinned. Employees can react (👍, 🎉) and comment.
- **Usage:** Replaces mass emails. Creates a sense of community and keeps everyone informed.

---

## 12. Reports & Analytics Dashboard

### 12.1 HR Analytics Dashboard

- **Working:** A visual dashboard with key metrics:
  - **Headcount:** Total employees, new hires this month, attrition this month, attrition rate (%).
  - **Demographics:** Gender ratio, age distribution, department-wise headcount (bar chart).
  - **Attendance:** Average attendance rate, late arrivals trend, department-wise absenteeism.
  - **Leave:** Most-used leave types, leave balance utilization, upcoming leaves.
  - **Payroll:** Total payroll cost, department-wise cost, average salary, cost trend over 12 months.
  - **Performance:** Rating distribution (bell curve), top performers, employees on PIP.
  All charts are interactive (click to drill down) and built with a charting library (e.g., Recharts).
- **Usage:** Gives leadership data-driven insights. "We have a 25% attrition rate in Engineering — let's investigate" is a conversation that can only happen with this data.

### 12.2 Custom Report Builder

- **Working:** Users select data fields (employee name, department, salary, leave balance, performance rating, etc.), apply filters, choose grouping/aggregation, and generate a tabular report. Reports can be saved, scheduled (auto-email every Monday), and exported to CSV/Excel/PDF.
- **Usage:** Every organization has unique reporting needs. A custom builder ensures they don't need to request engineering help for every report.

### 12.3 Compliance Reports

- **Working:** Pre-built reports for statutory compliance: PF/ESI contribution reports, tax deduction reports, equal opportunity / diversity reports, overtime compliance, headcount reports by location.
- **Usage:** Required during government audits and filings. Having these one-click-away saves HR weeks of work.

---

## 13. Role-Based Access Control (RBAC)

### 13.1 Predefined Roles

- **Working:** The system ships with default roles:
  - **Super Admin:** Full access to everything, including billing and tenant settings.
  - **HR Admin:** Full access to employee data, payroll, recruitment, and reports.
  - **Manager:** Access to their team's attendance, leaves, performance, and limited reports.
  - **Employee:** Access to their own profile, leaves, attendance, payslips, and self-service features.
  - **Finance:** Access to payroll, reimbursements, and financial reports.
  - **Recruiter:** Access to recruitment module only.
- **Usage:** Ensures data security and principle of least privilege. A manager should never see another team's payroll data.

### 13.2 Custom Roles & Permissions

- **Working:** Admins can create custom roles by selecting granular permissions: `employee.read`, `employee.write`, `employee.delete`, `payroll.process`, `leave.approve`, `report.export`, etc. Each permission maps to an API endpoint and a UI element (buttons/menu items are hidden if the user lacks permission).
- **Usage:** Not every organization fits into predefined roles. A "Regional HR" role might have employee access only for their branch.

### 13.3 Field-Level Permissions

- **Working:** Beyond module-level access, admins can control field visibility. For example, a Manager can see employee names and designations but NOT salary details. The API excludes restricted fields from the response, and the UI hides those columns/fields.
- **Usage:** Salary confidentiality is a common requirement. This feature ensures sensitive data is only visible to authorized roles.

---

## 14. Settings & Configuration

### 14.1 General Settings

- **Working:** Company name, logo, timezone, date format, currency, fiscal year start, working days per week, working hours per day.
- **Usage:** One-time setup that tailors the entire application to the organization's locale and policies.

### 14.2 Attendance & Leave Policies

- **Working:** Configure: grace period for late arrivals, half-day threshold, minimum working hours, leave accrual rules, carry-forward limits, leave approval hierarchy, holiday lists per branch.
- **Usage:** Policies vary wildly between companies and countries. This configurability is what makes it a true SAAS — one product, thousands of configurations.

### 14.3 Payroll Configuration

- **Working:** Define salary components (earnings/deductions), statutory contribution rates (PF %, ESI %), tax slabs, payroll cycle (monthly/bi-weekly), payment date, bank file format.
- **Usage:** Payroll rules change with government regulations. Admins can update rates without code changes.

### 14.4 Email Templates

- **Working:** Customize email templates for: welcome email, leave approval/rejection, payslip notification, review reminder, birthday wishes, etc. Templates support dynamic variables (`{{employee.name}}`, `{{leave.type}}`).
- **Usage:** Companies want their communication to reflect their brand voice. An enterprise won't send the same email tone as a startup.

### 14.5 Workflow Configuration

- **Working:** Define approval workflows for: leave requests, expense claims, salary revisions, offboarding. Workflows can be: single-level (Manager only), multi-level (Manager → HR → Director), or parallel (Manager AND HR simultaneously).
- **Usage:** Different processes need different approval chains. A 1-day casual leave might need only manager approval, while a 30-day sabbatical might need CEO approval.

---

## 15. Audit Logs & Compliance

### 15.1 Activity Audit Trail

- **Working:** Every data-changing action is logged: who did what, when, from which IP address, and what the before/after values were. Logs are immutable (append-only) and retained for a configurable period (default: 3 years). Admins can search/filter logs by user, action type, date range, and module.
- **Usage:** Critical for security investigations ("Who changed John's salary?"), compliance audits (SOC 2, GDPR), and dispute resolution.

### 15.2 Data Export & Deletion (GDPR/Privacy)

- **Working:** Employees can request a full export of their personal data (GDPR Article 15 — Right of Access). They can also request deletion of their data after separation (GDPR Article 17 — Right to Erasure), subject to legal retention requirements.
- **Usage:** Mandatory for companies with EU employees or customers. Non-compliance can result in fines up to 4% of annual revenue.

### 15.3 Data Backup & Recovery

- **Working:** Automated daily backups with point-in-time recovery. Backups are encrypted and stored in a geographically separate region. Recovery can be initiated by Super Admins with a confirmation step.
- **Usage:** Protects against data loss from accidental deletion, ransomware, or infrastructure failure.

---

## 16. Employee Self-Service Portal

### 16.1 Profile Management

- **Working:** Employees can view and update their personal information (phone, address, emergency contacts, profile photo) without HR intervention. Sensitive fields (name, bank details) require HR approval after employee submission.
- **Usage:** Reduces HR workload by 40–60% for routine data update requests.

### 16.2 Leave & Attendance Self-Service

- **Working:** Apply for leave, view leave balances, check attendance history, request attendance regularization (if they forgot to clock in), view the team calendar — all from a single, intuitive interface.
- **Usage:** Empowers employees to manage their time off independently.

### 16.3 Payslip & Tax Downloads

- **Working:** View and download payslips for any month, download tax computation statement, submit tax declarations and investment proofs.
- **Usage:** Employees need these documents frequently (for loans, visas, tax filing). Self-service means zero HR dependency.

### 16.4 Help Desk / Ticketing

- **Working:** Employees can raise tickets for HR queries: "My leave balance seems wrong," "I need a letter for visa application," "Reimbursement not credited." Tickets are categorized, prioritized, and assigned to HR staff. SLA tracking ensures timely resolution.
- **Usage:** Provides a structured channel for HR queries instead of random emails and Slack messages. Analytics on ticket volume helps HR identify systemic issues.

---

## 17. Integration & API

### 17.1 REST API

- **Working:** A fully documented RESTful API with versioning (`/api/v1/employees`), authentication (API keys + OAuth), rate limiting, and pagination. Covers all modules: employees, attendance, leaves, payroll, etc.
- **Usage:** Allows businesses to integrate the EMS with their existing tools (ERP, accounting software, CRM). Also enables building custom dashboards or mobile apps.

### 17.2 Third-Party Integrations

- **Working:** Pre-built integrations with:
  - **Communication:** Slack (leave notifications, kudos in channels), Microsoft Teams.
  - **Calendar:** Google Calendar, Outlook (sync holidays, leave, interviews).
  - **Accounting:** QuickBooks, Xero, Tally (export payroll journal entries).
  - **Biometric Devices:** Import attendance data from biometric/access control systems.
  - **Job Boards:** LinkedIn, Indeed, Naukri (post jobs, import applications).
  - **Cloud Storage:** Google Drive, Dropbox (document backup).
  - **SSO Providers:** Okta, Auth0, Azure AD (single sign-on).
- **Usage:** No tool exists in isolation. Integrations reduce double data-entry and keep systems in sync.

### 17.3 Webhooks

- **Working:** Admins configure webhooks that fire on specific events: `employee.created`, `leave.approved`, `payroll.processed`, `attendance.anomaly`. The system sends a POST request with event data to the configured URL.
- **Usage:** Enables real-time automation. For example, when `employee.created` fires, an external system can auto-provision an email account and Slack invite.

---

## 18. SaaS Billing Sandbox & Limit Enforcement

To showcase standard enterprise SaaS multi-tenancy limits without requiring paid payment gateways, the application features an interactive **Billing Sandbox and Gatekeeper** module.

### 18.1 SaaS Tier Control Panel (Sandbox Mode)

- **Working:** Admins access a dedicated billing dashboard that allows them to manually change the tenant's subscription status (`Starter`, `Professional`, `Enterprise`, or `Suspended`) via simple UI controls. This sandbox control lets interviewers instantly test how the app behaves under different states.
- **Usage:** Provides an easy way for reviewers to inspect SaaS tier features and test account suspension flows (which lock access to payroll and show an upgrade prompt).

### 18.2 Limit Gates & Enforcement

- **Working:** Limit checks are enforced during resource creation (e.g., adding employees, uploading files).
  - **Starter Tier limit:** Up to 5 employees. If the tenant has 5 employees and attempts to add another, the client-side form blocks action, and the backend route rejects the write with a clean `403 Plan Limit Reached` response.
  - **Professional Tier limit:** Up to 50 employees, unlocks Recruitment and Payroll features.
  - **Enterprise Tier limit:** Unlimited.
- **Usage:** Highlights structured gatekeeper middleware, robust server-side validation rules, and intuitive UX overlays showing real-time usage (e.g. `4/5 Active Employees`).

### 18.3 Interactive Upgrade Flows

- **Working:** Clicking the "Upgrade" button triggers a sleek animated check-out modal simulating a checkout card. Entering sandbox credentials instantly promotes the organization to `Professional` in MongoDB, updating Redux store state globally and immediately unlocking restricted dashboards (Framer Motion animations visually reveal the unlocked features).
- **Usage:** Demonstrates polished full-stack UI state transitions, responsive design patterns, and proper server/client state invalidation on plan updates.

---

## 19. AI Copilot & Automation

### 19.1 HR Policy Chatbot (RAG Pipeline)

- **Working:** An AI chatbot available to all employees. When asked a question (e.g., "What is the internet reimbursement limit?"), the system uses MongoDB Atlas Vector Search to find the exact paragraphs in the company's uploaded policy documents. It passes these paragraphs to an LLM (e.g., GPT-4o) which streams a natural language answer with citations.
- **Usage:** Drastically reduces the number of repetitive queries HR has to answer manually, saving hundreds of hours per month.

### 19.2 Smart Applicant Screening (ATS)

- **Working:** When a candidate applies, a background job uses the `text-embedding-3-small` model to create a semantic vector of their resume. When HR views a job posting, the system automatically ranks all applicants by calculating the vector similarity between their resumes and the job description.
- **Usage:** Helps recruiters instantly identify the top 5% of candidates in a pile of 500+ resumes, reducing time-to-hire.

### 19.3 Automated Performance Summaries

- **Working:** At the end of a performance review cycle, managers often have to read 5-10 peer reviews for each direct report. The AI reads all peer feedback and self-assessments, and generates a structured, unbiased "Executive Summary" highlighting key strengths, areas for improvement, and overall sentiment.
- **Usage:** Turns qualitative data into actionable insights instantly. Helps eliminate recency bias during reviews.

### 19.4 Intelligent Ticket Routing

- **Working:** When an employee submits a Helpdesk ticket, an LLM analyzes the description to determine the intent and urgency. It automatically categorizes the ticket (e.g., "Payroll Issue", "IT Support") and assigns it to the correct department head.
- **Usage:** Eliminates the "triage" step in HR support, resolving employee issues much faster.

---

## 20. SaaS Maker (Platform Owner) Admin Panel

A central administrative command center for the SaaS platform creator/owner. This interface exists at a level above individual tenant organizations, providing complete management and observability across all registered accounts.

### 20.1 Global SaaS Dashboard

- **Working:** Displays aggregated, platform-wide real-time metrics including:
  - **Key Performance Indicators:** Total tenants, total employees across all tenants, Monthly Recurring Revenue (MRR), and annual churn rate.
  - **Distribution Charts:** Tenant breakdown across pricing tiers (`Starter`, `Professional`, `Enterprise`, `Suspended`).
  - **Infrastructure Load Gauges:** System-wide metrics such as total daily API requests, current database size (MongoDB Atlas storage usage), total active WebSocket connections, and monthly AI invocations.
- **Usage:** Provides the platform owner with an instant, bird's-eye view of platform health, business growth, and system usage trends.

### 20.2 Tenant & Organization Management

- **Working:** A master directory of all organizations registered on the platform.
  - **Comprehensive Directory Table:** Lists each tenant's name, unique slug, owner name, active employee count, subscription plan, creation date, and status.
  - **Granular Status Controls:** Allows platform admins to change plan levels or immediately toggle tenant status between `Active` and `Suspended`. Suspension immediately revokes JWT validation for all users belonging to that organization.
  - **Secure Impersonation:** Includes an "Impersonate Tenant Admin" action. Clicking this generates a secure, audited, short-lived session token allowing the platform owner to temporarily access the target organization's dashboard with Tenant Admin rights to troubleshoot issues. All impersonated sessions are logged with the platform admin's identity, timestamp, and actions taken.
- **Usage:** Essential for customer support, onboarding, abuse prevention, and manual billing operations.

### 20.3 Plan & Pricing Configuration

- **Working:** A centralized manager for SaaS subscription plans.
  - **Plan Variables Configurator:** Allows configuration of monthly prices, maximum employee counts, maximum file storage allocations, and transactional email limits for each tier.
  - **Feature Gate Switches:** Enables or disables specific core modules (e.g., Recruitment, Performance Reviews, AI Copilot) per tier.
  - **Enforcement Rules:** Modifications made to these plan schemas are immediately reflected system-wide. The Gatekeeper middleware references these global schemas to restrict or permit features for active tenants depending on their assigned tier.
- **Usage:** Enables dynamic tier upgrades and easy adjustments to product bundles without code modifications.

### 20.4 Global Security & Audit Control

- **Working:** A centralized search and filter interface exposing high-level compliance and platform audit logs.
  - **Observed Events:** Tracks occurrences such as new tenant signups, plan upgrades, database migrations, security incidents (e.g., consecutive failed logins, potential cross-tenant API requests), and platform administrator actions (such as tenant impersonation or plan changes).
  - **Filtering Controls:** Searchable by organization ID, date ranges, actor type, or event category.
- **Usage:** Ensures compliance, simplifies debugging of multi-tenant routing issues, and provides a security trail for the platform.

### 20.5 Platform Announcements & Messaging

- **Working:** A communication tool to publish alerts or messages targeting specific groups of users or organizations.
  - **Target Options:** Allows broadcast targeting to all organizations, specific subscription tiers (e.g., only Starter users to promote a discount), or single organizations.
  - **Display Mechanisms:** Displays announcements as dismissible top banners or high-priority modal popups upon user login in the employee/admin portals.
- **Usage:** Communicates system maintenance, new feature rollouts, policy updates, and upgrade incentives.

### 20.6 AI Cost & Usage Tracker

- **Working:** A billing and usage dashboard detailing LLM resource consumption.
  - **Metrics Tracked:** Total prompt and completion tokens, image generation counts, embedding requests, and direct OpenAI API expense estimations.
  - **Optimization Insights:** Correlates AI utility usage against tenant subscription tiers to monitor platform profit margins and detect abusive usage patterns.
- **Usage:** Prevents cost overruns from heavy LLM usage and assists in pricing model optimization.

---

## State Management Architecture (Technical Reference)

We follow a **split-state architecture** — separating server state (API data) from client/UI state:

### Server State → TanStack Query (React Query v5)

All data fetched from the backend API is managed by **TanStack Query**. This gives us automatic caching, background refetching, optimistic updates, request deduplication, and stale-while-revalidate behavior out of the box.

```
TanStack Query Keys (Server State)
├── ['employees', filters]           # Employee directory list (paginated, filtered)
├── ['employees', employeeId]        # Single employee profile
├── ['departments']                  # Department tree
├── ['attendance', employeeId, date] # Attendance calendar
├── ['attendance', 'today']          # Today's clock-in status
├── ['leaves', 'balances']           # Leave balances for current user
├── ['leaves', 'requests', filters]  # Leave requests list
├── ['leaves', 'pending-approvals']  # Pending approvals for managers
├── ['payroll', 'runs', month]       # Payroll run for a month
├── ['payroll', 'payslips', empId]   # Payslip history
├── ['performance', 'reviews']       # Performance review cycles
├── ['performance', 'goals', empId]  # Goals for an employee
├── ['recruitment', 'jobs']          # Job postings
├── ['recruitment', 'applicants']    # Applicant pipeline
├── ['documents', empId]             # Employee documents
├── ['notifications']                # In-app notifications
├── ['reports', reportId]            # Saved/generated reports
├── ['organization', 'settings']     # Org settings & policies
├── ['billing', 'subscription']      # Current plan & usage
└── ['audit-logs', filters]          # Audit trail (paginated)
```

**Key TanStack Query Features Used:**
- **Optimistic Updates:** When approving a leave request, the UI updates instantly. If the API fails, TanStack Query automatically rolls back.
- **Infinite Queries:** Employee directory uses cursor-based pagination with `useInfiniteQuery`.
- **Prefetching:** When hovering over an employee row, we prefetch their profile so it loads instantly on click.
- **Cache Invalidation:** After adding an employee, we invalidate `['employees']` so the list auto-refreshes.

### Client/UI State → Redux Toolkit

Redux Toolkit is used exclusively for **complex client-side UI state** that doesn't come from the server:

```
Redux Store (Client/UI State)
├── auth/                    # Current user session, isAuthenticated, JWT tokens
├── ui/                      # Sidebar open/collapsed, active theme (light/dark)
│   ├── sidebar              # Sidebar collapse state
│   ├── modals               # Which modals are open, their data
│   ├── toasts               # Toast notification queue
│   └── filters              # Active filter selections (synced with URL)
├── rbac/                    # Current user's role & permissions (loaded on login)
├── onboarding/              # Multi-step onboarding wizard progress
└── dragDrop/                # Drag-and-drop state (org chart, kanban boards)
```

### Schema Validation → Zod

**Zod** is used for end-to-end type safety. A single Zod schema is shared between:
1. **Forms:** React Hook Form uses the Zod schema to validate inputs before submission.
2. **API Requests:** The same schema validates the payload before sending it to the backend.
3. **API Responses:** TanStack Query uses `.parse()` to validate API responses at runtime, catching backend bugs before they crash the UI.

### Animations → Framer Motion

**Framer Motion** is used for premium micro-animations:
- List items animate in/out when employees are added or removed.
- Page transitions use `AnimatePresence` for smooth route changes.
- Modals and popovers use spring-based enter/exit animations.
- Dashboard metric cards animate their numbers counting up on first load.

---

## Implementation Priority (Recommended Phases)

| Phase | Modules | Timeline |
|-------|---------|----------|
| **Phase 1 — MVP** | Auth, Employee CRUD, Department, RBAC (basic), Dashboard shell | Weeks 1–4 |
| **Phase 2 — Core HR** | Attendance, Leave Management, Holiday Calendar, Notifications | Weeks 5–8 |
| **Phase 3 — Payroll** | Salary Structure, Payroll Processing, Payslips, Tax | Weeks 9–12 |
| **Phase 4 — Performance** | Goal Setting, Review Cycles, 360° Feedback, Recognition | Weeks 13–16 |
| **Phase 5 — Recruitment** | Job Postings, ATS, Interview Scheduling, Onboarding/Offboarding | Weeks 17–20 |
| **Phase 6 — Advanced** | Custom Reports, Integrations, API, Document Management | Weeks 21–24 |
| **Phase 7 — SAAS** | Subscription & Billing, Multi-tenancy hardening, Audit Logs | Weeks 25–28 |
| **Phase 8 — AI Integration** | Vector Search, HR Chatbot, Smart ATS, Performance Summaries | Weeks 29–32 |
| **Phase 9 — Platform Admin** | Global SaaS Dashboard, Tenant Management, Impersonation, Plan Config, Audits | Weeks 33–36 |

---

> **Note:** This is a living document. Features will be refined and reprioritized as we progress through implementation. Each feature will get its own detailed technical specification before development begins.
