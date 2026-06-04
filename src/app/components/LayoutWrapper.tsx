"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden md:ml-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
export default LayoutWrapper;
