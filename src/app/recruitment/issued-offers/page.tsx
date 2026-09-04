"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import { Award } from "lucide-react";
import type { RootState } from "@/app/reduxToolkit/store";
import { OffersOverviewTab } from "@/components/recruitment/OffersOverviewTab";

export default function IssuedOffersPage() {
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  // Fetch Job Postings
  const { data: jobs = [] } = useQuery({
    queryKey: ["recruitment-jobs", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await axios.get(`/api/jobs?orgId=${orgId}&all=true`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Award className="h-6 w-6 text-emerald-600" />
            Issued Offers Overview
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track candidate responses, compensation packages, and onboarding status.
          </p>
        </div>
      </div>

      <OffersOverviewTab orgId={orgId || ""} jobs={jobs} />
    </div>
  );
}
