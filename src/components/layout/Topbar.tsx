"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Bell, Search, Menu, LogOut, ShieldAlert, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { RootState } from "../../app/reduxToolkit/store";
import { setAuthRole, setAuthSession, logoutUser } from "../../app/reduxToolkit/slice";

export function Topbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const isAuthenticated = useSelector((state: RootState) => state.employeeUI.isAuthenticated);

  const { data: organization } = useQuery({
    queryKey: ["organization", user?.orgId],
    queryFn: async () => {
      if (!user?.orgId || user.orgId === "platform_layer") return null;
      const res = await axios.get(`/api/organizations/${user.orgId}`);
      return res.data.data;
    },
    enabled: !!user?.orgId,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const email = e.target.value;
    
    if (email === "owner@saasmaker.in") {
      dispatch(setAuthSession({
        id: "mock_platform_owner",
        name: "Platform Owner",
        email: "owner@saasmaker.in",
        role: "platform_admin",
        orgId: "platform_layer",
      }));
      router.push("/saas-maker");
    } else if (email === "admin@company.in") {
      dispatch(setAuthSession({
        id: "64a7c1b2f43d8e001f9a0001",
        name: "Sahil",
        email: "admin@company.in",
        role: "org_admin",
        orgId: "org_default",
        department: "Human Resources",
        position: "CHRO (Head of HR)",
      }));
      router.push("/");
    } else if (email === "aarav.sharma@company.in") {
      dispatch(setAuthSession({
        id: "64a7c1b2f43d8e001f9a0002",
        name: "Aarav Sharma",
        email: "aarav.sharma@company.in",
        role: "employee",
        orgId: "org_default",
        department: "Engineering",
        position: "Senior Software Engineer",
      }));
      router.push("/");
    } else if (email === "vikram.malhotra@company.in") {
      dispatch(setAuthSession({
        id: "64a7c1b2f43d8e001f9a0003",
        name: "Vikram Malhotra",
        email: "vikram.malhotra@company.in",
        role: "employee",
        orgId: "org_default",
        department: "Sales",
        position: "VP of Sales (Head)",
      }));
      router.push("/");
    } else if (email === "neha.reddy@company.in") {
      dispatch(setAuthSession({
        id: "64a7c1b2f43d8e001f9a0004",
        name: "Neha Reddy",
        email: "neha.reddy@company.in",
        role: "employee",
        orgId: "org_default",
        department: "Finance",
        position: "CFO (Head)",
      }));
      router.push("/");
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/70 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-black/50">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-zinc-550 hover:bg-zinc-100 rounded-lg dark:hover:bg-zinc-800">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <Input
            type="search"
            placeholder="Search modules..."
            className="w-80 bg-zinc-50 pl-9 dark:bg-zinc-900 border-none shadow-none focus-visible:ring-1 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {organization && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
            <Building2 className="h-3.5 w-3.5" />
            {organization.name}
          </div>
        )}

        {/* Dynamic Testing Selector */}
        {isAuthenticated && user && (
          <div className="flex items-center gap-2 border border-dashed border-zinc-250 dark:border-zinc-750 px-3 py-1 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
            <span className="text-zinc-400 font-semibold flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
              Auth Mode:
            </span>
            <select
              value={user.email}
              onChange={handleProfileChange}
              className="bg-transparent font-bold text-zinc-850 dark:text-zinc-100 focus:outline-none cursor-pointer"
            >
              <option value="admin@company.in">Sahil (HR Admin)</option>
              <option value="owner@saasmaker.in">SaaS Maker Owner</option>
              <option value="aarav.sharma@company.in">Aarav Sharma (Engineering SSE)</option>
              <option value="vikram.malhotra@company.in">Vikram Malhotra (VP of Sales)</option>
              <option value="neha.reddy@company.in">Neha Reddy (Finance CFO)</option>
            </select>
          </div>
        )}

        <button className="relative p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black"></span>
        </button>

        {/* User Card & Logout */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <Link 
              href={user.role === "platform_admin" ? "#" : "/dashboard/profile"}
              className="flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-1.5 pr-3 rounded-full transition-all cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
            >
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold block text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </span>
                <span className="text-xxs text-zinc-400 font-medium uppercase block tracking-wider">
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 ring-2 ring-white shadow-sm dark:ring-black flex items-center justify-center text-white font-bold text-xs uppercase">
                {user.name.charAt(0)}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded-full transition-colors"
              title="Logout Profile Session"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/")}
            className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Log In
          </button>
        )}
      </div>
    </header>
  );
}
