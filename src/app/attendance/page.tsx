"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Coffee,
  Compass,
  LogOut,
  Users,
  UserX,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RootState } from "../reduxToolkit/store";

export default function AttendancePage() {
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const userRole = user?.role || "employee";
  const queryClient = useQueryClient();

  // Employee-only local states
  const [clockedIn, setClockedIn] = useState<boolean>(false);
  const [onBreak, setOnBreak] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("09:00 AM");
  const [personalLogs, setPersonalLogs] = useState<any[]>([
    { id: 1, date: "Today", clockIn: "09:00 AM", clockOut: "--", duration: "--", status: "Active" },
    { id: 2, date: "Yesterday", clockIn: "08:55 AM", clockOut: "06:02 PM", duration: "9h 7m", status: "Completed" },
    { id: 3, date: "29 May 2026", clockIn: "09:02 AM", clockOut: "05:45 PM", duration: "8h 43m", status: "Completed" },
  ]);

  // Admin-only global query fetching all employees
  const { data: employees, isLoading, isError } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await axios.get("/api/employees");
      return res.data.data || [];
    },
    enabled: userRole === "org_admin",
  });

  // Admin-only checkout mutation
  const forceCheckoutMutation = useMutation({
    mutationFn: async (empId: string) => {
      await axios.put(`/api/employees/${empId}`, { clockedIn: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      alert("Employee logged out successfully in the active timesheet.");
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to checkout employee.");
    },
  });

  // Toggle clockedIn for Employee
  const handleClockToggle = () => {
    if (!clockedIn) {
      setClockedIn(true);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(now);
      setPersonalLogs((prev) => [
        { id: Date.now(), date: "Today", clockIn: now, clockOut: "--", duration: "--", status: "Active" },
        ...prev.filter((log) => log.date !== "Today"),
      ]);
    } else {
      setClockedIn(false);
      setOnBreak(false);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setPersonalLogs((prev) =>
        prev.map((log) =>
          log.date === "Today"
            ? { ...log, clockOut: now, duration: "8h 15m", status: "Completed" }
            : log
        )
      );
    }
  };

  const handleBreakToggle = () => {
    setOnBreak(!onBreak);
  };

  // ----------------------------------------------------
  // ORG ADMIN VIEW (MANAGER ROSTER)
  // ----------------------------------------------------
  if (userRole === "org_admin") {
    const totalCount = employees?.length || 0;
    const activeDuty = employees?.filter((e: any) => e.clockedIn).length || 0;
    const onLeave = 2; // Mock statistic

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Attendance Administration
          </h1>
          <p className="text-sm text-zinc-500">
            Monitor real-time duty logs, view active shift counts, and checkout workforce members.
          </p>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-zinc-500">Active Shift Duty</span>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeDuty} In</h3>
              <span className="text-xs text-zinc-400 block font-medium">Currently clocked in today</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-zinc-500">Offline Members</span>
              <h3 className="text-2xl font-bold text-zinc-650">{totalCount - activeDuty - onLeave} Out</h3>
              <span className="text-xs text-zinc-400 block font-medium">Offline or shift completed</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-850 text-zinc-500">
              <UserX className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-medium text-zinc-500">Approved Leaves Today</span>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{onLeave} On Leave</h3>
              <span className="text-xs text-zinc-400 block font-medium">Authorized time-off days</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
              <CalendarCheck className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Global Timesheet Grid */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Real-Time Workforce Timesheet
          </h3>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-zinc-500">Querying live timesheet registers...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-red-500">Failed to load team timesheet.</div>
          ) : employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs font-semibold text-zinc-400 uppercase border-b border-zinc-150 dark:border-zinc-800 pb-2">
                    <th className="pb-2">Employee Name</th>
                    <th className="pb-2">Position</th>
                    <th className="pb-2">Roster status</th>
                    <th className="pb-2">Registered Time</th>
                    <th className="pb-2 text-right">Duty Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {employees.map((emp: any) => (
                    <tr key={emp._id || emp.id} className="text-zinc-700 dark:text-zinc-300">
                      <td className="py-3 font-semibold text-zinc-950 dark:text-zinc-50">
                        {emp.empName}
                      </td>
                      <td className="py-3">{emp.empPosition}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xxs font-semibold ${
                            emp.clockedIn
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : "bg-zinc-150 text-zinc-600 dark:bg-zinc-850 dark:text-zinc-400"
                          }`}
                        >
                          {emp.clockedIn ? "Clocked In" : "Offline"}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-zinc-400 font-medium">
                        {emp.clockedIn ? "09:00 AM Today" : "--"}
                      </td>
                      <td className="py-3 text-right">
                        {emp.clockedIn && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={forceCheckoutMutation.isPending}
                            onClick={() => forceCheckoutMutation.mutate(emp._id || emp.id)}
                            className="inline-flex items-center gap-1 text-xs"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Force Checkout
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400">No active employees found.</div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // EMPLOYEE VIEW (SELF-SERVICE TERMINAL)
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Attendance Terminal
        </h1>
        <p className="text-sm text-zinc-500">
          Record your daily working hours, manage break segments, and verify timesheets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clocking Station */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-4">
              <Compass className="h-3 w-3" />
              General Shift (9 AM - 6 PM)
            </span>
            <h2 className="text-sm font-medium text-zinc-400 block">Duty Status</h2>
            <div className="my-6">
              {clockedIn ? (
                onBreak ? (
                  <div className="text-amber-500 font-bold text-lg flex items-center justify-center gap-2">
                    <Coffee className="h-6 w-6 animate-bounce" />
                    On Break
                  </div>
                ) : (
                  <div className="text-emerald-500 font-bold text-lg flex items-center justify-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    Active Duty
                  </div>
                )
              ) : (
                <div className="text-zinc-400 font-bold text-lg flex items-center justify-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  Off Duty
                </div>
              )}
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 my-4">
              {clockedIn && !onBreak ? "Active" : clockedIn ? "Paused" : "00:00:00"}
            </div>
          </div>

          <div className="w-full space-y-3">
            <Button
              onClick={handleClockToggle}
              className={`w-full py-6 text-base font-semibold shadow-md transition-all ${
                clockedIn
                  ? "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {clockedIn ? (
                <>
                  <LogOut className="h-5 w-5 mr-2" />
                  Clock Out
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 mr-2" />
                  Clock In
                </>
              )}
            </Button>

            {clockedIn && (
              <Button
                onClick={handleBreakToggle}
                variant="outline"
                className={`w-full py-5 text-sm font-medium ${
                  onBreak
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                    : "border-zinc-200"
                }`}
              >
                <Coffee className="h-4 w-4 mr-2" />
                {onBreak ? "End Break" : "Start Break"}
              </Button>
            )}
          </div>
        </div>

        {/* Personal Logs */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-4">Personal Timesheet Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Weekly Working Hours</span>
                <span className="text-lg font-bold text-zinc-950 dark:text-zinc-50">17.8 Hours</span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Roster Compliance</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">98.2%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <h4 className="text-sm font-semibold mb-3">Recent Work Sessions</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs font-semibold text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Clock In</th>
                    <th className="pb-2">Clock Out</th>
                    <th className="pb-2">Total Hours</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {personalLogs.map((log) => (
                    <tr key={log.id} className="text-zinc-700 dark:text-zinc-300">
                      <td className="py-2.5 font-medium">{log.date}</td>
                      <td className="py-2.5">{log.clockIn}</td>
                      <td className="py-2.5">{log.clockOut}</td>
                      <td className="py-2.5">{log.duration}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xxs font-medium ${
                            log.status === "Active"
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
