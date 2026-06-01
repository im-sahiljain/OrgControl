"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Coins, Download, ShieldCheck, Loader2, Play, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RootState } from "../reduxToolkit/store";

export default function PayrollPage() {
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const userRole = user?.role || "employee";

  const [processing, setProcessing] = useState<boolean>(false);
  const [processed, setProcessed] = useState<boolean>(false);

  // Payslips in INR (₹)
  const payslips = [
    { id: 1, month: "May 2026", gross: "₹85,000.00", deductions: "₹12,400.00", net: "₹72,600.00", status: "Paid" },
    { id: 2, month: "April 2026", gross: "₹85,000.00", deductions: "₹12,400.00", net: "₹72,600.00", status: "Paid" },
    { id: 3, month: "March 2026", gross: "₹85,000.00", deductions: "₹12,400.00", net: "₹72,600.00", status: "Paid" },
  ];

  const handleProcessPayroll = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setProcessed(true);
      alert("Payroll ledger calculation executed successfully in INR for all active employees.");
    }, 2000);
  };

  // ----------------------------------------------------
  // ORG ADMIN VIEW (MANAGER PAYROLL PROCESSING)
  // ----------------------------------------------------
  if (userRole === "org_admin") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Payroll Processing Workspace
            </h1>
            <p className="text-sm text-zinc-500">
              Configure master salary templates, process recurring workforce cycles, and audit cash flows in INR.
            </p>
          </div>
          <Button
            onClick={handleProcessPayroll}
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 self-start md:self-auto"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Ledger...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                Run Payroll Cycle
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Salary Structure template */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-600" />
              SaaS FTE Template
            </h3>
            <p className="text-xs text-zinc-550">
              Current month calculations utilize the Standard FTE structure (INR).
            </p>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm space-y-2 pt-2">
              <div className="flex justify-between py-1.5 font-medium">
                <span className="text-zinc-500">Basic Earnings</span>
                <span>50.0%</span>
              </div>
              <div className="flex justify-between py-1.5 font-medium">
                <span className="text-zinc-500">House Rent HRA</span>
                <span>25.0%</span>
              </div>
              <div className="flex justify-between py-1.5 font-medium">
                <span className="text-zinc-500">Provident Tax PF</span>
                <span className="text-red-500">12.0%</span>
              </div>
            </div>
          </div>

          {/* Process ledger log */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold mb-2">Processing History Log</h3>
              <p className="text-sm text-zinc-500 mb-6">
                Cycle status is monitored by the automatic tenant gatekeeper constraints.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-650">Current Cycle status</span>
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">
                  {processed ? "Calculated" : "Awaiting Trigger"}
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: processed ? "100%" : "25%" }}
                ></div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>Salary calculations utilize the Mongoose row-level org isolation keys automatically.</span>
            </div>
          </div>
        </div>

        {/* Global processed ledgers */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold mb-4">Total Organization Payslips</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs font-semibold text-zinc-400 uppercase border-b border-zinc-150 dark:border-zinc-800 pb-2">
                  <th className="pb-2">Period</th>
                  <th className="pb-2">Gross Earnings</th>
                  <th className="pb-2">Deductions</th>
                  <th className="pb-2">Net Payout</th>
                  <th className="pb-2 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {payslips.map((slip) => (
                  <tr key={slip.id} className="text-zinc-700 dark:text-zinc-300">
                    <td className="py-3.5 font-semibold">{slip.month}</td>
                    <td className="py-3.5">{slip.gross}</td>
                    <td className="py-3.5 text-red-500">{slip.deductions}</td>
                    <td className="py-3.5 font-bold text-zinc-950 dark:text-zinc-50">{slip.net}</td>
                    <td className="py-3.5 text-right text-xs font-semibold text-zinc-400 uppercase">
                      Processed Paid
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
  // EMPLOYEE VIEW (SELF-SERVICE PAYSLIPS)
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          My Salary & Payslips
        </h1>
        <p className="text-sm text-zinc-550">
          Review your personal monthly salary structure, tax declarations, and statement sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Active Salary Allocation (INR)
          </h3>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-955 rounded-lg border border-zinc-100 dark:border-zinc-850">
            <span className="text-xs text-zinc-405 block">Monthly Base Salary</span>
            <span className="text-xl font-bold text-zinc-955 dark:text-zinc-50">₹75,000.00 / month</span>
            <span className="text-xxs text-zinc-450 block mt-1">Gross annual base: ₹9,00,000.00</span>
          </div>

          <div className="text-xs text-zinc-450 space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between">
              <span>Basic Salary</span>
              <span className="font-semibold text-zinc-750 dark:text-zinc-300">₹37,500.00</span>
            </div>
            <div className="flex justify-between">
              <span>House Rent (HRA)</span>
              <span className="font-semibold text-zinc-750 dark:text-zinc-300">₹18,750.00</span>
            </div>
            <div className="flex justify-between">
              <span>Provident Fund (PF)</span>
              <span className="font-semibold text-red-500">-₹4,500.00</span>
            </div>
          </div>
        </div>

        {/* Payslips table */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold mb-4">Statement Documents</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs font-semibold text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <th className="pb-2">Period</th>
                  <th className="pb-2">Gross</th>
                  <th className="pb-2">Deductions</th>
                  <th className="pb-2">Net Pay</th>
                  <th className="pb-2 text-right">Statement Sheet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {payslips.map((slip) => (
                  <tr key={slip.id} className="text-zinc-700 dark:text-zinc-300">
                    <td className="py-3 font-semibold">{slip.month}</td>
                    <td className="py-3">{slip.gross}</td>
                    <td className="py-3 text-red-500">{slip.deductions}</td>
                    <td className="py-3 font-bold text-zinc-950 dark:text-zinc-50">{slip.net}</td>
                    <td className="py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Initiated payslip download in INR for ${slip.month}`)}
                        className="inline-flex items-center gap-1 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
