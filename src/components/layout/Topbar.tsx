"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Bell,
  Search,
  Menu,
  LogOut,
  ShieldAlert,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { RootState } from "../../app/reduxToolkit/store";
import { setAuthSession, logoutUser } from "../../app/reduxToolkit/slice";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.employeeUI.isAuthenticated,
  );

  const { data: organization } = useQuery({
    queryKey: ["organization", user?.orgId],
    queryFn: async () => {
      if (!user?.orgId || user.orgId === "platform_layer") return null;
      const res = await axios.get(`/api/organizations/${user.orgId}`);
      return res.data.data;
    },
    enabled: !!user?.orgId,
  });

  // Get Org Technologies _id for platform admin fallback
  const { data: defaultOrg } = useQuery({
    queryKey: ["org-technologies-slug"],
    queryFn: async () => {
      const res = await axios.get("/api/organizations/org-technologies");
      return res.data.data;
    },
    enabled: isAuthenticated && user?.orgId === "platform_layer",
  });

  const activeOrgId =
    user?.orgId === "platform_layer" ? defaultOrg?._id : user?.orgId;

  // Fetch employees of the active organization
  const { data: employees } = useQuery({
    queryKey: ["topbar-employees", activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return [];
      const res = await axios.get(`/api/employees?orgId=${activeOrgId}`);
      return res.data.data || [];
    },
    enabled: !!activeOrgId,
  });

  // Fetch the platform owner details
  const { data: platformOwner } = useQuery({
    queryKey: ["topbar-platform-owner"],
    queryFn: async () => {
      const res = await axios.get("/api/auth/platform-owner");
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  // Construct dynamic profiles list
  const rawSwitcherProfiles: any[] = [];
  if (platformOwner) {
    rawSwitcherProfiles.push({
      id: platformOwner._id || platformOwner.id,
      name: platformOwner.name,
      email: platformOwner.email,
      role: "platform_admin",
      orgId: "platform_layer",
      label: `${platformOwner.name} (SaaS Owner)`,
    });
  }
  if (employees) {
    employees.forEach((emp: any) => {
      const isHrAdmin =
        emp.department === "Human Resources" &&
        (emp.empPosition.toLowerCase().includes("head") ||
          emp.empPosition.toLowerCase().includes("chro"));
      const role = isHrAdmin ? "org_admin" : "employee";
      rawSwitcherProfiles.push({
        id: emp._id || emp.id,
        name: emp.empName,
        email: emp.email,
        role: role,
        orgId: activeOrgId,
        department: emp.department,
        position: emp.empPosition,
        label: `${emp.empName} (${emp.empPosition})`,
      });
    });
  }

  // Hide everything except the CHRO in the UI switcher
  const switcherProfiles = rawSwitcherProfiles.filter(
    (p) => p.department === "Human Resources" && p.role === "org_admin",
  );

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const email = e.target.value;
    const selectedProfile = switcherProfiles.find((p) => p.email === email);
    if (selectedProfile) {
      dispatch(
        setAuthSession({
          id: selectedProfile.id,
          name: selectedProfile.name,
          email: selectedProfile.email,
          role: selectedProfile.role,
          orgId: selectedProfile.orgId,
          department: selectedProfile.department,
          position: selectedProfile.position,
        }),
      );
      if (selectedProfile.role === "platform_admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (e) {
      console.error("Server logout error:", e);
    }
    dispatch(logoutUser());
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/70 px-4 md:px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-black/50">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-zinc-550 hover:bg-zinc-100 rounded-lg dark:hover:bg-zinc-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        {/* <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <Input
            type="search"
            placeholder="Search modules..."
            className="w-80 bg-zinc-50 pl-9 dark:bg-zinc-900 border-none shadow-none focus-visible:ring-1 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700 text-sm"
          />
        </div> */}
        {isAuthenticated && user && (
          <span className="text-xxs text-black-400 font-medium uppercase">
            {user.role.replace("_", " ")}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {organization && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
            <Building2 className="h-3.5 w-3.5" />
            {organization.name}
          </div>
        )}

        {/* Dynamic Testing Selector */}
        {/* {isAuthenticated && user && switcherProfiles.length > 0 && (
          <div className="flex items-center gap-1.5 border border-dashed border-zinc-250 dark:border-zinc-750 px-2 sm:px-3 py-1 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
            <span className="text-zinc-400 font-semibold hidden md:flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
              Auth Mode:
            </span>
            <select
              value={user.email}
              onChange={handleProfileChange}
              className="bg-transparent font-bold text-zinc-850 dark:text-zinc-100 focus:outline-none cursor-pointer max-w-[120px] sm:max-w-[200px] truncate text-xxs sm:text-xs"
            >
              {switcherProfiles.map((p) => (
                <option key={p.email} value={p.email}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        )} */}

        {/* <button className="relative p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black"></span>
        </button> */}

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
                {/* <span className="text-xxs text-zinc-400 font-medium uppercase block tracking-wider">
                  {user.role.replace("_", " ")}
                </span> */}
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
