"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  User,
  Mail,
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/app/reduxToolkit/store";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  const {
    data: employee,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employee-detail", id, orgId],
    queryFn: async () => {
      if (!id || !orgId) return null;
      const res = await axios.get(`/api/employees/${id}?orgId=${orgId}`);
      return res.data.data;
    },
    enabled: !!id && !!orgId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="text-xs font-bold text-zinc-500">
          Loading employee profile...
        </span>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-4 max-w-lg mx-auto my-12 text-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Employee Not Found
        </h2>
        <p className="text-xs text-zinc-500">
          We could not locate this employee profile in your organization
          records.
        </p>
        <Button
          onClick={() => router.push("/employees")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Employees Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/employees")}
          className="h-8 text-xs font-bold gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Directory
        </Button>

        <span className="text-xs font-extrabold px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-900 capitalize">
          Status: {employee.status || "Active"}
        </span>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 dark:border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {employee.empName?.charAt(0) || "E"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {employee.empName}
              </h1>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {employee.empPosition || "Team Member"}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-blue-600" /> Work Email
            </span>
            <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 font-mono truncate">
              {employee.email || "—"}
            </p>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" /> Department
            </span>
            <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
              {employee.department || "Engineering"}
            </p>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
              <IndianRupee className="h-3.5 w-3.5 text-emerald-600" /> Annual
              Package
            </span>
            <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹ {(employee.salary || 80000).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-amber-600" /> Age
            </span>
            <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
              {employee.empAge || 25} Years
            </p>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-purple-600" /> Onboarded
              Date
            </span>
            <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
              {employee.createdAt
                ? new Date(employee.createdAt).toLocaleDateString()
                : "Recent"}
            </p>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> System
              Status
            </span>
            <p className="text-xs font-extrabold text-teal-600 dark:text-teal-400 capitalize">
              Active Member
            </p>
          </div>
        </div>

        {/* Leave Balances */}
        {employee.leaveBalances && (
          <div className="p-5 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Leave Balances
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 block">
                  Casual Leave
                </span>
                <strong className="text-base font-extrabold text-blue-600">
                  {employee.leaveBalances.casual || 12} Days
                </strong>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 block">
                  Sick Leave
                </span>
                <strong className="text-base font-extrabold text-amber-600">
                  {employee.leaveBalances.sick || 10} Days
                </strong>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 block">
                  Earned Leave
                </span>
                <strong className="text-base font-extrabold text-emerald-600">
                  {employee.leaveBalances.earned || 15} Days
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
