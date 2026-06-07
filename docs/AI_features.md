# Proposed AI Features — OrgControl Platform

This document outlines high-impact, interview-winning features selected from our predefined department registry that can be integrated with AI to showcase advanced full-stack and AI engineering capabilities.

---

## 1. 🧑‍💼 HR: AI-Powered Candidate Screener & Interview Planner
* **Source Registry Feature**: HR Feature #1 (Recruitment & Hiring Pipeline)
* **Interview Selling Point**: Demonstrates complex state management (drag-and-drop Kanban hiring boards), data extraction, and role-based access control.
* **AI Integration Capabilities**:
  * **Resume Parsing**: Automatically extracts key skills, experience, and contact details from uploaded PDF resumes to populate database schemas.
  * **Smart Match Score**: Compares extracted candidate data against the target job description to generate a matching score (%) alongside structured pros and cons.
  * **Interview Assistant**: Generates 3-4 custom, behavioral interview questions for the hiring manager based on gaps identified in the candidate's resume.

---

## 2. 💰 Finance: Smart Receipt OCR Scanner & Expense Claimer
* **Source Registry Feature**: Finance Feature #3 (Expense Management)
* **Interview Selling Point**: Showcases multi-stage approval workflows (Member → Manager → Finance), audit logs, and transaction processing.
* **AI Integration Capabilities**:
  * **OCR Receipt Reader**: Parses uploaded receipt images (JPG/PNG) using a Vision LLM or OCR to automatically extract the merchant name, date, total amount, and currency (with auto-conversion to INR).
  * **Auto-Categorization**: Analyzes transaction details to automatically categorize the expense (e.g., AWS billing → "Infrastructure", Client dinner → "Client Relations") to pre-fill the submission form.

---

## 3. ⚙️ Engineering: Intelligent CI/CD Build Log Analyzer
* **Source Registry Feature**: Engineering Feature #4 (CI/CD Pipeline Dashboard)
* **Interview Selling Point**: Highly technical feature showing deep understanding of developer workflows, CI/CD pipelines, and internal tools.
* **AI Integration Capabilities**:
  * **Build Log Analyzer**: If a simulated build or test script fails, the AI parses the raw compile logs (Webpack/Next.js/Docker errors) and outputs:
    1. A human-readable summary of the exact error.
    2. The target file and line number causing the crash.
    3. A proposed code fix or patch diff that the developer can copy-paste.

---

## 4. 📦 Product: Customer Feedback Analyzer & PRD Spec Generator
* **Source Registry Feature**: Product Feature #8 (Feedback & Feature Requests)
* **Interview Selling Point**: Highlights "Product-minded Engineering" by demonstrating a focus on value delivery and product specification design.
* **AI Integration Capabilities**:
  * **Sentiment & Tagging**: Aggregates customer feedback to classify sentiment and automatically tag categories (e.g., "Bug", "Feature Request", "UI/UX").
  * **One-Click PRD Generator**: Generates a complete Product Requirement Document (PRD) directly from a highly voted customer feedback card, complete with user stories, technical scope, and acceptance criteria.
