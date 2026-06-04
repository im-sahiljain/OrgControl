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
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = useSelector(
    (state: RootState) => state.employeeUI.isAuthenticated,
  );

  // Fetch organization "Org Technologies" slug "org-technologies" to get its real _id
  const { data: orgData } = useQuery({
    queryKey: ["org-technologies"],
    queryFn: async () => {
      const res = await axios.get("/api/organizations/org-technologies");
      return res.data.data;
    },
  });

  // Fetch the platform owner details (dynamic from DB via new route)
  const { data: platformOwner } = useQuery({
    queryKey: ["platform-owner"],
    queryFn: async () => {
      const res = await axios.get("/api/auth/platform-owner");
      return res.data.data;
    },
  });

  // Fetch all dynamically created employees from the database for Org Technologies
  const { data: dynamicEmployees, isLoading } = useQuery({
    queryKey: ["employees-login"],
    queryFn: async () => {
      const res = await axios.get("/api/auth/sandbox-profiles");
      return res.data.data || [];
    },
  });

  // Build profile list dynamically
  const allLoginProfiles: any[] = [];

  // Add employees first, check for HR admin role
  if (dynamicEmployees) {
    dynamicEmployees.forEach((emp: any) => {
      const isHrAdmin = emp.department === "Human Resources" && (
        emp.empPosition.toLowerCase().includes("head") || 
        emp.empPosition.toLowerCase().includes("chro")
      );
      const role = isHrAdmin ? ("org_admin" as const) : ("employee" as const);
      
      allLoginProfiles.push({
        id: emp._id || emp.id,
        role: role,
        name: emp.empName,
        email: emp.email,
        desc: isHrAdmin 
          ? `Log in as HR Administrator (${emp.empName}) to supervise directories, payroll and layouts.`
          : `Log in as ${emp.empName} to access the ${emp.department || "Organization"} workspace.`,
        icon: isHrAdmin ? ShieldCheck : Users,
        color: isHrAdmin
          ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/10 text-zinc-650",
        department: emp.department || "Unassigned",
        position: emp.empPosition,
      });
    });
  }

  // Add Platform Owner if present
  if (platformOwner) {
    allLoginProfiles.push({
      id: platformOwner._id || platformOwner.id,
      role: "platform_admin" as const,
      name: platformOwner.name,
      email: platformOwner.email,
      desc: "Access global multi-tenant metrics, MRR growth, active connection pools, and tenant control.",
      icon: Cpu,
      color: "border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400",
      department: "System Administration",
      position: "Platform Owner",
    });
  }

  const handleLogin = (preset: any) => {
    dispatch(
      loginUser({
        id: preset.id,
        name: preset.name,
        email: preset.email,
        role: preset.role,
        orgId: preset.role === "platform_admin" ? "platform_layer" : (orgData?._id || "org_default"),
        department: preset.department,
        position: preset.position,
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

  // Filter in UI to only show CHRO view under HR department
  const displayedUniqueDepts = uniqueDepartments.filter((dept) => dept === "Human Resources");
  const displayedProfiles = filteredProfiles.filter((p) => p.role === "org_admin");

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              O
            </div>
            <span className="font-bold text-zinc-900 dark:text-zinc-50">
              Org Control
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
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

      {/* Mobile Drawer */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-200 bg-white dark:border-zinc-850 dark:bg-zinc-950 transition-transform duration-300 transform md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-4 py-6">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                O
              </div>
              <span className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Org Control
              </span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1">
            <p className="text-xs text-zinc-400 font-medium px-2 uppercase tracking-wider mb-4">
              Simulation Portal
            </p>
            <div className="px-2 py-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-150 dark:border-zinc-850 text-xs text-zinc-500 leading-relaxed">
              Use the Simulation Sandbox on the main screen to sign in with mock roles.
            </div>
          </div>

          {/* Moved buttons at the bottom of the sidebar */}
          <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-zinc-800 space-y-3">
            <Link href="/register" onClick={() => setMenuOpen(false)} className="block w-full">
              <Button
                variant="outline"
                className="w-full justify-start h-10 gap-2 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
              >
                <Plus className="h-4 w-4" />
                Org Register
              </Button>
            </Link>
            <Link href="/auth/org" onClick={() => setMenuOpen(false)} className="block w-full">
              <Button
                variant="outline"
                className="w-full justify-start h-10 gap-2 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
              >
                <LogIn className="h-4 w-4" />
                Org Login
              </Button>
            </Link>
            <Link href="/auth/admin" onClick={() => setMenuOpen(false)} className="block w-full">
              <Button
                variant="outline"
                className="w-full justify-start h-10 gap-2 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50"
              >
                <ShieldAlert className="h-4 w-4" />
                Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </aside>

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
                {displayedUniqueDepts.map((dept) => (
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
                {displayedProfiles.map((preset) => (
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
