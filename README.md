# Org Control 🏢

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![Redux Toolkit](https://img.shields.io/badge/Redux-Toolkit-purple)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-red)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

**Org Control** is a scalable, multi-tenant SaaS Employee and Organization Management platform built to showcase advanced modern frontend architecture, complex state management, and secure AI integrations.

## ✨ Key Features

- **Multi-Tenant Architecture:** Securely manages data across multiple organizations using MongoDB document isolation and strict multi-tenancy models.
- **Dynamic Department Dashboards:** Custom-rendered, interactive workspaces tailored specifically for distinct corporate divisions (Engineering, Sales, HR, Finance) and hierarchical levels.
- **Hybrid State Management:** Strategically decouples asynchronous server-state fetching via **TanStack Query** from complex, synchronous client-side UI interactions managed by **Redux Toolkit**.
- **Role-Based Access Control (RBAC):** Stringent permissions mapped across the entire stack, restricting specific modules, routes, and data based on active session roles (`org_admin`, `platform_admin`, `employee`).
- **Secure Streaming AI Copilot:** Features an integrated AI assistant that dynamically intercepts and contextually filters user queries based on active Redux session states—preventing unauthorized access to aggregate payroll or sensitive corporate metrics.
- **End-to-End Type Safety:** Fully typed across the stack using **TypeScript** and **Zod** schema validation for robust, crash-resistant API routes and client forms.

## 🚀 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **State Management:** Redux Toolkit (Client State) + TanStack Query (Server State)
- **Database:** MongoDB Atlas (Mongoose)
- **Validation:** Zod
- **Styling & UI:** Tailwind CSS, Shadcn UI, Framer Motion
- **AI Integration:** Vercel AI SDK

## 💻 Getting Started

First, clone the repository and install dependencies:

```bash
git clone https://github.com/im-sahiljain/OrgControl.git
cd OrgControl
npm install
```

Ensure your environment variables are configured in `.env` (refer to `.env.sample`). 

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔐 Authentication Presets

For testing purposes, the login page features multiple one-click authentication presets to immediately jump into different roles (e.g., HR Admin, Standard Employee, Platform SaaS Owner). You can also use the Developer Switcher in the top navigation bar to quickly swap session roles on the fly.
