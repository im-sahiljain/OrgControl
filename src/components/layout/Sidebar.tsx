"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Home,
  Users,
  Clock,
  CalendarRange,
  Coins,
  TrendingUp,
  Cpu,
  Settings,
  ShieldAlert,
  LogOut,
  Plus,
  UserPlus,
} from "lucide-react";
import type { RootState } from "../../app/reduxToolkit/store";

export function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.employeeUI.isAuthenticated,
  );

  // Filter main nav items dynamically based on the active session role
  const mainNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["org_admin", "employee"],
    },
    {
      name: "SaaS Maker Admin",
      href: "/admin/dashboard",
      icon: ShieldAlert,
      roles: ["platform_admin"],
    },
    {
      name: "Provision Tenant",
      href: "/admin/onboard",
      icon: Plus,
      roles: ["platform_admin"],
    },
    {
      name: "Employees",
      href: "/employees",
      icon: Users,
      roles: ["org_admin"],
    },
    {
      name: "Recruitment",
      href: "/features/hr_recruitment",
      icon: UserPlus,
      roles: ["org_admin", "employee"],
    },
    {
      name: "Attendance",
      href: "/attendance",
      icon: Clock,
      roles: ["org_admin", "employee"],
    },
    {
      name: "Leaves",
      href: "/leaves",
      icon: CalendarRange,
      roles: ["org_admin", "employee"],
    },
    { name: "Payroll", href: "/payroll", icon: Coins, roles: ["org_admin"] },
    {
      name: "Performance",
      href: "/performance",
      icon: TrendingUp,
      roles: ["org_admin", "employee"],
    },
    {
      name: "AI Copilot",
      href: "/ai-copilot",
      icon: Cpu,
      roles: ["org_admin", "employee"],
    },
  ];

  const bottomNavItems = [
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["org_admin", "employee", "platform_admin"],
    },
    {
      name: "Switch Profile",
      href: "/",
      icon: LogOut,
      roles: ["org_admin", "employee", "platform_admin"],
    },
  ];

  // If on login page (root /), hide sidebar completely for a clean screen layout
  if (pathname === "/") {
    return null;
  }

  const userRole = user?.role || "employee";
  const userDept = user?.department || "";
  const filteredMainNav = mainNavItems.filter((item) => {
    // Hide everything except Dashboard and Recruitment in the UI
    if (item.name !== "Dashboard" && item.name !== "Recruitment") {
      return false;
    }
    if (!item.roles.includes(userRole)) return false;
    // Only show "Recruitment" to org_admin or employees in Human Resources department
    if (item.name === "Recruitment" && userRole !== "org_admin" && userDept !== "Human Resources") {
      return false;
    }
    return true;
  });
  const filteredBottomNav = bottomNavItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-zinc-200 bg-white/70 backdrop-blur-md dark:border-zinc-800 dark:bg-black/50 hidden md:block">
        <div className="flex h-full flex-col px-4 py-6">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              O
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Org Control
            </span>
          </div>

          <nav className="flex-1 space-y-1">
            {filteredMainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-zinc-800">
            {filteredBottomNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Slide-over Drawer */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-200 bg-white dark:border-zinc-850 dark:bg-zinc-950 transition-transform duration-300 transform md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-4 py-6">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                O
              </div>
              <span className="text-xl font-semibold tracking-tight">
                Org Control
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {filteredMainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-zinc-200 pt-4 dark:border-zinc-800">
            {filteredBottomNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900/50 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"}`}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
