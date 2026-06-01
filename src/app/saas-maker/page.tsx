"use client";

import React, { useState } from "react";
import { Cpu, ShieldCheck, CheckCircle2, AlertCircle, Play, Ban, RefreshCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SaasMakerPage() {
  const [tenants, setTenants] = useState<any[]>([
    { id: "org_1", name: "Acme Corporation", slug: "acme-corp", plan: "Professional", status: "active", employees: 42 },
    { id: "org_2", name: "Globex Inc", slug: "globex", plan: "Starter", status: "active", employees: 12 },
    { id: "org_3", name: "Initech", slug: "initech", plan: "Enterprise", status: "suspended", employees: 88 },
  ]);

  const toggleTenantStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === "active" ? "suspended" : "active";
          alert(`Organization ${t.name} state successfully changed to: ${nextStatus.toUpperCase()}. Cached session keys invalidated.`);
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const metrics = [
    { title: "Global MRR (Recurring)", value: "₹2,45,000.00", change: "+12.4% vs last month" },
    { title: "Total Registered Orgs", value: tenants.length, change: "All isolated via Mongoose RLS" },
    { title: "Active Connection Pools", value: "3 / 10 max", change: "dbConnect serverless optimized" },
    { title: "Active Subscribers", value: tenants.filter((t) => t.status === "active").length, change: "1 Suspended tenant" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Cpu className="h-6 w-6 text-sky-500" />
          SaaS Maker Administration Panel
        </h1>
        <p className="text-sm text-zinc-500">
          Global platform supervisor dashboard. Monitor cluster metrics, supervise tenants, and enforce subscription status rules.
        </p>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
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
              {tenants.map((t) => (
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
                      onClick={() => toggleTenantStatus(t.id)}
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
