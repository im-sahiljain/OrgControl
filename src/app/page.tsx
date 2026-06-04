"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { loginUser } from "./reduxToolkit/slice";
import type { RootState } from "./reduxToolkit/store";
import {
  Cpu,
  ShieldAlert,
  Users,
  ShieldCheck,
  Building2,
  LogIn,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: RootState) => state.employeeUI.isAuthenticated,
  );

  const staticAdminPresets = [
    {
      role: "org_admin" as const,
      name: "Sahil",
      email: "admin@company.in",
      desc: "Supervise directories, process monthly payroll networks, configure visual layouts.",
      icon: ShieldCheck,
      color:
        "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
      department: "System Administration",
      position: "CHRO (Head of HR)",
    },
    {
      role: "platform_admin" as const,
      name: "SaaS Maker",
      email: "owner@saasmaker.in",
      desc: "Access global MRR analytics, database Connection pools, and Tenant organization suspension gates.",
      icon: Cpu,
      color:
        "border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400",
      department: "System Administration",
      position: "Platform Owner",
    },
  ];

  // Fetch all dynamically created employees from the database
  const { data: dynamicEmployees, isLoading } = useQuery({
    queryKey: ["employees-login"],
    queryFn: async () => {
      const res = await axios.get("/api/employees?orgId=org_default");
      return res.data.data || [];
    },
  });

  // Combine static admin presets with dynamic employees
  const allLoginProfiles = [
    staticAdminPresets[0], // HR Admin
    ...(dynamicEmployees || []).map((emp: any) => ({
      role: "employee" as const,
      name: emp.empName,
      email:
        emp.email ||
        `${emp.empName.toLowerCase().replace(/\s+/g, ".")}@company.in`,
      desc: `Log in as ${emp.empName} to access the ${emp.department || "Organization"} dashboard.`,
      icon: Users,
      color:
        "border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/10 text-zinc-650",
      department: emp.department,
      position: emp.empPosition,
      id: emp._id || emp.id,
    })),
    staticAdminPresets[1], // Platform Admin
  ];

  const handleLogin = (preset: any) => {
    dispatch(
      loginUser({
        id:
          preset.id ||
          (preset.role === "platform_admin"
            ? "mock_platform_owner"
            : preset.role === "org_admin"
              ? "mock_hr_head"
              : `mock_${preset.name.toLowerCase().split(" ")[0]}`),
        name: preset.name,
        email: preset.email,
        role: preset.role,
        orgId: "org_default",
        department: preset.department,
      }),
    );
    if (preset.role === "platform_admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );

  const uniqueDepartments = Array.from(
    new Set(allLoginProfiles.map((p) => p.department || "Unassigned")),
  );
  const filteredProfiles = allLoginProfiles.filter(
    (p) => (p.department || "Unassigned") === selectedDepartment,
  );

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            O
          </div>
          <span className="font-bold text-zinc-900 dark:text-zinc-50">
            Org Control
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/register">
            <Button
              variant="outline"
              className="h-9 gap-1.5 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <Plus className="h-4 w-4" />
              Org Register
            </Button>
          </Link>
          <Link href="/auth/org">
            <Button
              variant="outline"
              className="h-9 gap-1.5 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <LogIn className="h-4 w-4" />
              Org Login
            </Button>
          </Link>
          <Link href="/auth/admin">
            <Button
              variant="outline"
              className="h-9 gap-1.5 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <ShieldAlert className="h-4 w-4" />
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center justify-center gap-2">
              <Building2 className="h-5 w-5 text-zinc-400" />
              Simulation Sandbox
            </h2>
            <p className="text-sm text-zinc-505 max-w-lg mx-auto">
              Select a mock profile card below to sign in instantly with
              specialized permissions. These are purely for testing UI layout
              renders.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12 w-full text-zinc-500 text-sm">
              Loading active employee directories...
            </div>
          ) : !selectedDepartment ? (
            <div className="space-y-4 w-full animate-fade-in">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 text-center mb-4">
                Select a Department
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {uniqueDepartments.map((dept) => (
                  <div
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex items-center gap-3 bg-white dark:bg-zinc-950 group"
                  >
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-105 transition-transform">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {dept}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setSelectedDepartment(null)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {selectedDepartment} Employees
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProfiles.map((preset) => (
                  <div
                    key={preset.email}
                    onClick={() => handleLogin(preset)}
                    className={`p-4 rounded-xl border border-dashed hover:border-solid hover:shadow-md cursor-pointer transition-all flex items-start gap-4 ${preset.color} ${
                      preset.role === "platform_admin" ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shrink-0 shadow-sm border border-zinc-150 dark:border-zinc-800">
                      <preset.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {preset.name}
                      </h4>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                        {preset.position}
                      </p>
                      <p className="text-xs text-zinc-500 font-medium truncate">
                        {preset.email}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
                        {preset.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400">
            <p>
              Role permissions are enforced logically at the front-end layout
              and server layers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
