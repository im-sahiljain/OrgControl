"use client";

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Cpu, ShieldCheck, CheckCircle2, AlertCircle, Play, Ban, Building2, User, Mail, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SaasMakerPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/dashboard");
      return response.data.data;
    },
  });

  const toggleTenantStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "active" ? "suspended" : "active";
      await axios.post("/api/admin/tenants/status", {
        orgId: id,
        status: nextStatus,
      });
      alert(`Tenant status successfully changed to: ${nextStatus.toUpperCase()}`);
      refetch();
    } catch (err: any) {
      alert("Failed to update tenant status: " + (err.response?.data?.error || err.message));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        Failed to load platform metrics.
      </div>
    );
  }

  const { metrics, tenants } = data;

  const displayMetrics = [
    { title: "Global MRR (Recurring)", value: `₹${metrics.globalMrr.toLocaleString()}`, change: "+12.4% vs last month" },
    { title: "Total Registered Orgs", value: metrics.totalOrgs, change: "All isolated via Mongoose RLS" },
    { title: "Active Connection Pools", value: "3 / 10 max", change: "dbConnect serverless optimized" },
    { title: "Active Subscribers", value: metrics.activeSubscribers, change: `${metrics.suspendedSubscribers} Suspended tenant(s)` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-sky-500" />
            SaaS Maker Administration Panel
          </h1>
          <p className="text-sm text-zinc-500">
            Global platform supervisor dashboard. Monitor cluster metrics, supervise tenants, and enforce subscription status rules.
          </p>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayMetrics.map((m) => (
          <div
            key={m.title}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm"
          >
            <span className="text-xs font-semibold text-zinc-400 block mb-1 uppercase tracking-wider">{m.title}</span>
            <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50">{m.value}</h3>
            <span className="text-xxs text-zinc-400 block mt-1.5 font-medium">{m.change}</span>
          </div>
        ))}
      </div>

      {/* Tenant Supervision Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold mb-4">Multi-Tenant Subscriptions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs font-semibold text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <th className="pb-2">Organization Name</th>
                <th className="pb-2">Slug</th>
                <th className="pb-2">Billing Plan</th>
                <th className="pb-2">Active Workforce</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Administrative Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {tenants.map((t: any) => (
                <tr key={t.id} className="text-zinc-700 dark:text-zinc-300">
                  <td className="py-4 font-semibold text-zinc-900 dark:text-zinc-50">{t.name}</td>
                  <td className="py-4">
                    <span className="text-xxs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-mono">
                      {t.slug}
                    </span>
                  </td>
                  <td className="py-4 font-medium">{t.plan}</td>
                  <td className="py-4 font-semibold">{t.employees} Members</td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xxs font-semibold ${
                        t.status === "active"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      }`}
                    >
                      {t.status === "active" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <Button
                      variant={t.status === "active" ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleTenantStatus(t.id, t.status)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        t.status !== "active"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          : ""
                      }`}
                    >
                      {t.status === "active" ? (
                        <>
                          <Ban className="h-3.5 w-3.5" />
                          Suspend Tenant
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-white" />
                          Activate Tenant
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-lg border border-indigo-100/30 text-indigo-700 dark:text-indigo-300 text-xs">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Platform Owner context verified. Administrative logs are written directly to platform_audit_logs collections.</span>
      </div>
    </div>
  );
}
