"use client";

import React, { useState } from "react";
import axios from "axios";
import { Cpu, Building2, User, Mail, Loader2, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardTenantPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    adminName: "",
    adminEmail: "",
    plan: "Starter"
  });
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    setProvisionError("");
    setSuccessMsg("");

    try {
      const response = await axios.post("/api/organizations/register", {
        ...formData,
        plan: formData.plan.toLowerCase()
      });

      if (response.data.success) {
        setSuccessMsg(`Organization '${formData.companyName}' successfully provisioned! The new tenant environment is live with ID: ${response.data.orgId}.`);
        setFormData({ companyName: "", adminName: "", adminEmail: "", plan: "Starter" });
      } else {
        setProvisionError(response.data.error || "Failed to provision.");
      }
    } catch (err: any) {
      setProvisionError(err.response?.data?.error || "Unexpected error occurred.");
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Plus className="h-6 w-6 text-emerald-500" />
            Provision New Organization
          </h1>
          <p className="text-sm text-zinc-500">
            Create an isolated tenant environment, initialize the default hierarchy, and generate an administrator account.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm max-w-3xl animate-fade-in">
        <h3 className="text-lg font-bold mb-6 text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-850 pb-4">
          Tenant Details
        </h3>
        
        {provisionError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100">
            {provisionError}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleProvisionSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">Organization Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Acme Corp" className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-950" />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">Billing Plan</label>
              <select 
                value={formData.plan} 
                onChange={e => setFormData({...formData, plan: e.target.value})}
                className="w-full h-11 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Starter">Starter (1-50 employees)</option>
                <option value="Professional">Professional (51-100 employees)</option>
                <option value="Enterprise">Enterprise (100+ employees)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">Initial Admin Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input required value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} placeholder="Jane Doe" className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-950" />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">Admin Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input required type="email" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} placeholder="jane@acme.com" className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-950" />
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isProvisioning} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-8 rounded-lg shadow-md">
              {isProvisioning ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {isProvisioning ? "Provisioning Database..." : "Provision Tenant"}
            </Button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs max-w-3xl">
        <Cpu className="h-4 w-4 shrink-0" />
        <span>This action automatically provisions a dedicated MongoDB sub-cluster logically isolated via Mongoose RLS.</span>
      </div>
    </div>
  );
}
