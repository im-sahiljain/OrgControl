"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "../reduxToolkit/slice";
import type { RootState } from "../reduxToolkit/store";
import { Cpu, ShieldAlert, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.employeeUI.isAuthenticated);

  const presets = [
    {
      role: "platform_admin" as const,
      name: "SaaS Maker (Platform Owner)",
      email: "owner@saasmaker.in",
      desc: "Access global MRR analytics, database Connection pools, and Tenant organization suspension gates.",
      icon: Cpu,
      color: "border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400",
    },
    {
      role: "org_admin" as const,
      name: "Sahil (CHRO / HR Admin)",
      email: "admin@company.in",
      desc: "Supervise directories, process monthly payroll networks, configure visual layouts.",
      icon: ShieldCheck,
      color: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
      department: "Human Resources",
      position: "CHRO (Head of HR)",
    },
    {
      role: "employee" as const,
      name: "Aarav Sharma (Engineering SSE)",
      email: "aarav.sharma@company.in",
      desc: "Software developer sprint tasks, log code submissions, trigger production mock deployments.",
      icon: Users,
      color: "border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/10 text-zinc-650",
      department: "Engineering",
      position: "Senior Software Engineer",
    },
    {
      role: "employee" as const,
      name: "Vikram Malhotra (VP of Sales)",
      email: "vikram.malhotra@company.in",
      desc: "Set team quotas, manage regional commission charts, monitor high-level sales pipeline metrics.",
      icon: ShieldCheck,
      color: "border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400",
      department: "Sales",
      position: "VP of Sales (Head)",
    },
    {
      role: "employee" as const,
      name: "Neha Reddy (CFO)",
      email: "neha.reddy@company.in",
      desc: "Treasury reserve trackers, CFO expense disbursement approvals, capital allocations dashboards.",
      icon: Cpu,
      color: "border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400",
      department: "Finance",
      position: "CFO (Head)",
    },
  ];

  const handleLogin = (preset: typeof presets[number]) => {
    dispatch(
      loginUser({
        id: preset.role === "platform_admin" ? "mock_platform_owner" : (preset.role === "org_admin" ? "mock_hr_head" : `mock_${preset.name.toLowerCase().split(" ")[0]}`),
        name: preset.name.split(" (")[0], // Strip the profile suffix for a clean visual name
        email: preset.email,
        role: preset.role,
        orgId: "org_default",
        department: (preset as any).department,
        position: (preset as any).position,
      })
    );
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
            R
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            SaaS Workspace Authentication
          </h1>
          <p className="text-sm text-zinc-505">
            Select a simulation profile card below to sign in instantly with specialized permissions.
          </p>
        </div>

        <div className="space-y-4">
          {presets.map((preset) => (
            <div
              key={preset.role}
              onClick={() => handleLogin(preset)}
              className={`p-4 rounded-xl border border-dashed hover:border-solid hover:shadow-md cursor-pointer transition-all flex items-start gap-4 ${preset.color}`}
            >
              <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shrink-0 shadow-sm border border-zinc-150 dark:border-zinc-800">
                <preset.icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {preset.name}
                </h4>
                <p className="text-xs text-zinc-500 font-medium">{preset.email}</p>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{preset.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-xxs text-zinc-400 flex items-center justify-center gap-1">
          <ShieldAlert className="h-3 w-3" />
          Role permissions are enforced logically at the front-end layout and server layers.
        </div>
      </div>
    </div>
  );
}
