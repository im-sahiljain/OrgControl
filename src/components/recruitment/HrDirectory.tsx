"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DepartmentFeature } from "@/lib/departmentRegistry";
import { ArrowLeft, Search, Filter, Mail, Briefcase, CalendarClock, Building } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/app/reduxToolkit/store";
import { resolveDepartmentRole, getFeatureAccessLevel } from "@/lib/roleResolver";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export default function HrDirectory({ feature }: { feature: DepartmentFeature }) {
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axios.get(`/api/departments?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  const userDept = departments?.find((d: any) => d.name === user?.department);
  const roleContext = resolveDepartmentRole(userDept, user?.id || "");
  const accessLevel = getFeatureAccessLevel(feature, roleContext.role);
  const isViewOnly = accessLevel === "view_only" || accessLevel === "none";

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await axios.get(`/api/employees?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  const filteredEmployees = employees?.filter((emp: any) => {
    const matchesSearch = emp.empName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.empPosition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "all" || emp.department === filterDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{feature.name}</h1>
          <p className="text-sm text-zinc-500">{feature.description}</p>
        </div>
      </div>

      {isViewOnly && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm font-semibold">
          You have view-only access to this directory based on your current role ({roleContext.role}).
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search employees by name or position..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-[180px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-semibold">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments?.map((d: any) => (
                <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees?.map((emp: any) => (
          <div key={emp._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg">
                  {emp.empName.charAt(0)}
                </div>
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  emp.status === "active" ? "bg-emerald-50 text-emerald-600" :
                  emp.status === "onboarding" ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-500"
                }`}>
                  {emp.status.toUpperCase()}
                </span>
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">{emp.empName}</h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-1">
                <Briefcase className="h-3.5 w-3.5" /> {emp.empPosition}
              </p>
            </div>
            
            <div className="mt-6 space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-850 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Building className="h-3.5 w-3.5 text-zinc-400" />
                {emp.department}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                {emp.email}
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5 text-zinc-400" />
                Joined: {new Date(emp.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
