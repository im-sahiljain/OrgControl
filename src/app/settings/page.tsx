"use client";

import React, { useState } from "react";
import { Settings, Shield, Globe, Award, Cloud, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>("USD");
  const [timezone, setTimezone] = useState<string>("America/New_York");
  const [companyName, setCompanyName] = useState<string>("SaaS Maker Sandbox");

  const handleSave = () => {
    alert("Configuration parameters updated successfully in the tenant metadata.");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Platform Configuration
        </h1>
        <p className="text-sm text-zinc-500">
          Configure security credentials, organization-wide defaults, billing tiers, and integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar inside Settings */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 text-left">
            <Globe className="h-4.5 w-4.5" />
            General Profile
          </button>
          <button
            onClick={() => alert("MFA settings locked. Premium sandbox only.")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50 text-left"
          >
            <Shield className="h-4.5 w-4.5" />
            Security & MFA
          </button>
          <button
            onClick={() => alert("Billing records locked. Standard Developer tier active.")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50 text-left"
          >
            <CreditCard className="h-4.5 w-4.5" />
            Billing Plan
          </button>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Organization Settings
            </h3>

            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">TimeZone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/New_York">EST (New York)</option>
                    <option value="Asia/Kolkata">IST (Kolkata)</option>
                    <option value="Europe/London">GMT (London)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Preferred Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* MFA / Security details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Security Configuration
            </h3>

            <div className="flex items-start justify-between">
              <div className="space-y-1 max-w-[80%]">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 block">
                  Enforce Multi-Factor Authentication (MFA)
                </span>
                <span className="text-xs text-zinc-400 block leading-relaxed">
                  Require all organization users to complete TOTP credential checks when signing in.
                </span>
              </div>
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={() => setMfaEnabled(!mfaEnabled)}
                className="h-4.5 w-4.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Cloudinary connection details */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Cloud className="h-5 w-5 text-sky-500" />
              Cloudinary Media Account
            </h3>
            <p className="text-xs text-zinc-400">
              Integrations utilize Cloudinary base64 media endpoints for secure profile picture rendering.
            </p>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs flex justify-between items-center text-zinc-600 dark:text-zinc-400 font-medium">
              <span>Cloudinary status: Simulated active</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
