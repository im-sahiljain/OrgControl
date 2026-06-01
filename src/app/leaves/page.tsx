"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { CalendarRange, Plus, CheckCircle2, RefreshCcw, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RootState } from "../reduxToolkit/store";

export default function LeavesPage() {
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const userRole = user?.role || "employee";

  const [isApplyOpen, setIsApplyOpen] = useState<boolean>(false);
  const [leaveType, setLeaveType] = useState<string>("casual");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  // Simulated organization-wide database of leave requests
  const [allRequests, setAllRequests] = useState<any[]>([
    { id: 1, empName: "Aarav Sharma", type: "Casual Leave", start: "2026-06-10", end: "2026-06-12", days: 3, reason: "Family trip", status: "pending" },
    { id: 2, empName: "Ananya Patel", type: "Sick Leave", start: "2026-05-14", end: "2026-05-15", days: 2, reason: "Fever recovery", status: "approved" },
    { id: 3, empName: "Rohan Gupta", type: "Earned Leave", start: "2026-06-01", end: "2026-06-05", days: 5, reason: "Annual vacation", status: "pending" },
  ]);

  const handleApply = () => {
    if (!startDate || !endDate || !reason) {
      alert("Please fill out all fields.");
      return;
    }
    const days = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)) + 1;
    const newRequest = {
      id: Date.now(),
      empName: user?.name || "Aarav Sharma",
      type: leaveType === "casual" ? "Casual Leave" : leaveType === "sick" ? "Sick Leave" : "Earned Leave",
      start: startDate,
      end: endDate,
      days: days > 0 ? days : 1,
      reason,
      status: "pending",
    };
    setAllRequests([newRequest, ...allRequests]);
    setIsApplyOpen(false);
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const handleAction = (id: number, nextStatus: "approved" | "rejected") => {
    setAllRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
    );
    alert(`Leave request state successfully updated to: ${nextStatus.toUpperCase()}`);
  };

  const balances = [
    { title: "Casual Leaves", allocated: 12, used: 4, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" },
    { title: "Sick Leaves", allocated: 10, used: 3, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "Earned Leaves", allocated: 15, used: 0, color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20" },
  ];

  // ----------------------------------------------------
  // ORG ADMIN VIEW (MANAGER LEAVE APPROVALS)
  // ----------------------------------------------------
  if (userRole === "org_admin") {
    const pendingCount = allRequests.filter((r) => r.status === "pending").length;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Leave Administration
          </h1>
          <p className="text-sm text-zinc-500">
            Review and audit employee time-off requests, and configure company leave limits.
          </p>
        </div>

        {/* Admin pending approvals overview */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-blue-600" />
              Pending Leave Approval Queue
            </h3>
            <span className="text-xs px-2.5 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 rounded-full font-bold">
              {pendingCount} Pending Requests
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs font-semibold text-zinc-400 uppercase border-b border-zinc-150 dark:border-zinc-800 pb-2">
                  <th className="pb-2">Employee</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Date Frame</th>
                  <th className="pb-2">Days</th>
                  <th className="pb-2">Reason</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Manager Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {allRequests.map((req) => (
                  <tr key={req.id} className="text-zinc-700 dark:text-zinc-300">
                    <td className="py-3.5 font-bold text-zinc-950 dark:text-zinc-50">{req.empName}</td>
                    <td className="py-3.5 font-medium">{req.type}</td>
                    <td className="py-3.5 text-xs">{req.start} to {req.end}</td>
                    <td className="py-3.5 font-semibold">{req.days} Day(s)</td>
                    <td className="py-3.5 max-w-xs truncate text-zinc-500">{req.reason}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xxs font-semibold ${
                          req.status === "pending"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            : req.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                        }`}
                      >
                        {req.status === "pending" ? (
                          <RefreshCcw className="h-3 w-3 animate-spin" />
                        ) : req.status === "approved" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {req.status === "pending" && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleAction(req.id, "approved")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(req.id, "rejected")}
                            className="text-xs font-semibold"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // EMPLOYEE VIEW (SELF-SERVICE TIME OFF)
  // ----------------------------------------------------
  const personalRequests = allRequests.filter((r) => r.empName === (user?.name || "John Doe"));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Time Off Balance
          </h1>
          <p className="text-sm text-zinc-500">
            Request personal leaves, check remaining balances, and review historic logs.
          </p>
        </div>
        <Button
          onClick={() => setIsApplyOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Request Leave
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {balances.map((b) => (
          <div
            key={b.title}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{b.title}</span>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {b.allocated - b.used} <span className="text-xs text-zinc-400 font-medium">Days Left</span>
              </h3>
              <p className="text-xxs text-zinc-400 mt-2 font-medium">
                Allocated: {b.allocated} | Used: {b.used}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${b.color}`}>
              <CalendarRange className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Apply Leave Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 animate-scale-up space-y-4">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Apply for Time Off</h3>
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Start Date</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">End Date</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Reason</label>
                <Input
                  type="text"
                  placeholder="Explain brief reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsApplyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white">
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History log */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold mb-4">Your Request History</h3>
        {personalRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs font-semibold text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <th className="pb-2">Leave Type</th>
                  <th className="pb-2">Date Frame</th>
                  <th className="pb-2">Days</th>
                  <th className="pb-2">Reason</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {personalRequests.map((req) => (
                  <tr key={req.id} className="text-zinc-700 dark:text-zinc-300">
                    <td className="py-3 font-semibold">{req.type}</td>
                    <td className="py-3">{req.start} to {req.end}</td>
                    <td className="py-3">{req.days} Day(s)</td>
                    <td className="py-3 text-zinc-500 dark:text-zinc-400">{req.reason}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xxs font-semibold ${
                          req.status === "pending"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            : req.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                        }`}
                      >
                        {req.status === "pending" ? (
                          <RefreshCcw className="h-3 w-3 animate-spin" />
                        ) : req.status === "approved" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-400 text-sm">No leave requests found.</div>
        )}
      </div>
    </div>
  );
}
