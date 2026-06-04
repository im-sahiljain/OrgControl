"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import type { RootState } from "../reduxToolkit/store";
import { ShieldAlert, LogOut, ArrowRight, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setAuthSession } from "../reduxToolkit/slice";

export function RouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.employeeUI.isAuthenticated);
  const user = useSelector((state: RootState) => state.employeeUI.user);

  const [isRestoring, setIsRestoring] = React.useState(true);

  const publicRoutes = ["/", "/register", "/auth/org", "/auth/admin", "/pricing"];
  const segments = pathname.split("/").filter(Boolean);
  const isCompanyJobs = segments.length === 2 && segments[1] === "jobs";
  const isJobApplication = segments.length === 3 && segments[2] === "application";

  const isPublicRoute = 
    publicRoutes.includes(pathname) || 
    pathname === "/jobs" || 
    pathname.startsWith("/jobs/") ||
    isCompanyJobs ||
    isJobApplication;

  // Mount useEffect to restore session from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("org_control_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.id) {
            dispatch(setAuthSession(parsed));
          }
        } catch (e) {
          console.error("Error parsing saved session:", e);
        }
      }
    }
    setIsRestoring(false);
  }, [dispatch]);

  // 1. If not authenticated and not on a public route, force login screen inside useEffect
  React.useEffect(() => {
    if (!isRestoring && !isAuthenticated && !isPublicRoute) {
      router.push("/");
    }
  }, [isRestoring, isAuthenticated, isPublicRoute, router]);

  if (isRestoring && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-zinc-550 dark:text-zinc-400">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  // If on a public route and unauthenticated, let it render directly without sidebar wrappers
  if (isPublicRoute && !isAuthenticated) {
    return <>{children}</>;
  }

  const role = user?.role || "employee";

  // 2. Protect Platform Owner / SaaS Maker Panel
  if (pathname.startsWith("/admin") && role !== "platform_admin") {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="h-16 w-16 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          403 - SaaS Maker Access Restricted
        </h2>
        <p className="text-sm text-zinc-500 max-w-md mb-6 leading-relaxed">
          The requested platform administration panel is reserved strictly for Platform Owners (`platform_admin`).
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  // 3. Protect Admin-only Organization views from general Employees
  const adminRoutes = ["/employees", "/payroll"];
  if (adminRoutes.some((route) => pathname.startsWith(route)) && role === "employee") {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="h-16 w-16 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Administrative Credentials Required
        </h2>
        <p className="text-sm text-zinc-500 max-w-sm mb-6 leading-relaxed">
          Workforce directories, employee record modifiers, and payroll runs are locked for standard Employee profiles.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            Back to Employee Hub
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
