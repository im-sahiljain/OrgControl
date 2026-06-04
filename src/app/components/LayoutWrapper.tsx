"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicRoutes = ["/", "/register", "/auth/org", "/auth/admin", "/pricing"];
  const isAuthPage = publicRoutes.includes(pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 w-full flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden md:ml-64">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
export default LayoutWrapper;
