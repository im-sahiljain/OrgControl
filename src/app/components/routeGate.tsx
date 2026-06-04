"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import type { RootState } from "../reduxToolkit/store";
import { setAuthRole } from "../reduxToolkit/slice";
import { ShieldAlert, LogOut, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.employeeUI.isAuthenticated);
  const user = useSelector((state: RootState) => state.employeeUI.user);

  const publicRoutes = ["/", "/register", "/auth/org", "/auth/admin", "/pricing"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // 1. If not authenticated and not on a public route, force login screen inside useEffect
  React.useEffect(() => {
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/");
    }
  }, [isAuthenticated, isPublicRoute, router]);

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
            onClick={() => dispatch(setAuthRole("platform_admin"))}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            Elevate to SaaS Maker Owner
            <UserCheck className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
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
            onClick={() => dispatch(setAuthRole("org_admin"))}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            Elevate to HR Admin
            <UserCheck className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Employee Hub
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
