"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Building2, MapPin, Clock, ArrowRight, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CompanyJobsPage() {
  const { companyId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch organization details (by companyId slug or ID)
  const { data: orgData, isLoading: loadingOrg } = useQuery({
    queryKey: ["org-public", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const res = await axios.get(`/api/organizations/${companyId}`);
      return res.data.data;
    },
    enabled: !!companyId,
  });

  // 2. Fetch jobs for that organization
  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ["jobs-public", orgData?._id],
    queryFn: async () => {
      if (!orgData?._id) return [];
      const res = await axios.get(`/api/jobs?orgId=${orgData._id}`);
      return res.data.data || [];
    },
    enabled: !!orgData?._id,
  });

  const filteredJobs = jobs?.filter((job: any) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = loadingOrg || loadingJobs;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            O
          </div>
          <span className="font-bold text-zinc-900 dark:text-zinc-55">
            OrgControl Jobs
          </span>
        </div>
        {orgData && (
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/50">
            {orgData.name} Careers
          </span>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8">
        <div className="text-center py-8 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Join Our Innovative Team
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm leading-relaxed">
            Explore open opportunities at {orgData?.name || "our company"}. We are always looking for smart, ambitious, and passionate builders to define the future of technology.
          </p>

          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by role, department, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 animate-fade-in"
            />
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-zinc-500 font-medium">Fetching job openings...</p>
          </div>
        ) : filteredJobs && filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job: any) => (
              <div
                key={job._id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100/50 dark:border-blue-900/30">
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-400 font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      {job.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 transition-colors">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{job.location}</span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                  <Link href={`/${companyId}/${job._id}/application`}>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      View Position & Apply
                      <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50">
            <Building2 className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Job Postings Found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              There are currently no active job postings matching your query. Please check back later!
            </p>
          </div>
        )}
      </main>

      <footer className="py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 bg-white dark:bg-zinc-950 mt-12 shrink-0">
        <p>© {new Date().getFullYear()} {orgData?.name || "our company"}. All rights reserved.</p>
      </footer>
    </div>
  );
}
