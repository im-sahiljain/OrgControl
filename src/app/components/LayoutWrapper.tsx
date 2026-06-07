"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../reduxToolkit/store";
import { setSidebarCollapsed } from "../reduxToolkit/slice";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [enableTransition, setEnableTransition] = React.useState(false);

  const isCollapsed = useSelector(
    (state: RootState) => state.employeeUI.isSidebarCollapsed,
  );

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved === "true") {
        dispatch(setSidebarCollapsed(true));
      }
      // Enable CSS transitions after a short delay so the initial match happens instantly
      const timer = setTimeout(() => {
        setEnableTransition(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [dispatch]);

  const publicRoutes = ["/", "/register", "/auth/org", "/auth/admin", "/pricing"];
  const segments = pathname.split("/").filter(Boolean);
  const isCompanyJobs = segments.length === 2 && segments[1] === "jobs";
  const isJobApplication = segments.length === 3 && segments[2] === "application";
  const isJobsLegacy = pathname === "/jobs" || pathname.startsWith("/jobs/");

  const isPublicPage = 
    publicRoutes.includes(pathname) || 
    isJobsLegacy ||
    isCompanyJobs ||
    isJobApplication;

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 w-full flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} enableTransition={enableTransition} />
      <div suppressHydrationWarning className={`flex flex-col flex-1 overflow-hidden ${enableTransition ? "transition-all duration-300" : ""} ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
export default LayoutWrapper;
