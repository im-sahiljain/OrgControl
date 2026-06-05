"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import {
  Users,
  Sparkles,
  FileText,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeReviewDashboardWidgetProps {
  orgId: string;
}

export default function ResumeReviewDashboardWidget({
  orgId,
}: ResumeReviewDashboardWidgetProps) {
  // 1. Fetch dashboard metrics counts
  const {
    data: metrics,
    isLoading: loadingMetrics,
    isError: metricsError,
  } = useQuery({
    queryKey: ["dashboard-metrics", orgId],
    queryFn: async () => {
      const res = await axios.get(`/api/dashboard-metrics?orgId=${orgId}`);
      return (
        res.data.data || {
          totalResumes: 0,
          pendingScreenings: 0,
          highMatches: 0,
          avgMatchScore: 0,
        }
      );
    },
    enabled: !!orgId,
  });

  // 2. Fetch jobs to map titles
  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ["dashboard-all-jobs", orgId],
    queryFn: async () => {
      const res = await axios.get(`/api/jobs?orgId=${orgId}`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  // 3. Keep full candidates data for the recent applicants list only
  const { data: candidates, isLoading: loadingCandidates } = useQuery({
    queryKey: ["dashboard-recent-candidates", orgId],
    queryFn: async () => {
      const res = await axios.get(`/api/candidates?orgId=${orgId}`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  const isLoading = loadingMetrics || loadingCandidates || loadingJobs;

  const totalResumes = metrics?.totalResumes ?? 0;
  const pendingScreenings = metrics?.pendingScreenings ?? 0;
  const highMatches = metrics?.highMatches ?? 0;
  const avgMatchScore = metrics?.avgMatchScore ?? 0;

  const recentApplicants = candidates?.slice(0, 5) || [];

  console.log("totalResumes", totalResumes);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Metric 1: Total Candidates */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1 flex-1">
            <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider">
              Total Resumes
            </span>
            {isLoading ? (
              <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-28 animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold text-zinc-850 dark:text-zinc-50">
                {totalResumes} Candidates
              </p>
            )}
            <span className="text-sm text-zinc-400 font-medium">
              Applied database pool
            </span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2: Pending Screenings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1 flex-1">
            <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider">
              Pending AI Review
            </span>
            {isLoading ? (
              <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-28 animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold text-zinc-850 dark:text-zinc-50">
                {pendingScreenings} Unscreened
              </p>
            )}
            <span className="text-sm text-amber-500 font-bold">
              Needs AI assessment
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
        </div>

        {/* Metric 3: High Match Rates */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1 flex-1">
            <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider lg:whitespace-nowrap">
              High Match Candidates
            </span>
            {isLoading ? (
              <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-28 animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold text-zinc-850 dark:text-zinc-50">
                {highMatches} Profiles
              </p>
            )}
            <span className="text-sm text-emerald-500 font-bold">
              Match Score &ge; 80%
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4: Average Score */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1 flex-1">
            <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider">
              Avg Profile Match
            </span>
            {isLoading ? (
              <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-28 animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold text-zinc-850 dark:text-zinc-50">
                {avgMatchScore}%
              </p>
            )}
            <span className="text-sm text-violet-500 font-bold">
              Aggregate match rate
            </span>
          </div>
          <div className="p-3 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-xl">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Recruiter Workspace Quick Links & Activity Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications List */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-blue-600" />
              Recent Applicants Activity
            </p>
            <Link
              href="/features/hr_recruitment"
              className="text-xxs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850/60 rounded-xl flex items-center justify-between gap-4 animate-pulse"
                >
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-850 rounded w-1/3" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                  </div>
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
                </div>
              ))
            ) : recentApplicants.length > 0 ? (
              recentApplicants.map((cand: any) => {
                const jobTitle =
                  jobs?.find((j: any) => j._id === cand.jobId)?.title ||
                  "Position";
                return (
                  <div
                    key={cand._id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850/60 rounded-xl flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <span className="font-bold text-zinc-800 dark:text-zinc-100 block truncate">
                        {cand.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-semibold block truncate">
                        Applied for:{" "}
                        <span className="text-zinc-500 dark:text-zinc-300 font-bold">
                          {jobTitle}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {cand.isAiScreened ? (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            cand.matchScore >= 80
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : cand.matchScore >= 70
                                ? "bg-purple-50 text-purple-600 border border-purple-100"
                                : "bg-zinc-50 text-zinc-500 border border-zinc-100"
                          }`}
                        >
                          {cand.matchScore}% Match
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded">
                          Pending AI Review
                        </span>
                      )}

                      <span className="text-[10px] font-bold text-zinc-400 capitalize bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded shadow-sm">
                        {cand.stage}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-zinc-400 italic text-xs">
                No applicants in database yet.
              </div>
            )}
          </div>
        </div>

        {/* Recruiter Toolbox Shortcuts */}
        <div className="bg-linear-to-br from-indigo-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-950 border border-indigo-100/60 dark:border-zinc-850 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full min-h-[220px]">
          <div className="space-y-2">
            <span className="text-xxs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
              Recruiter Shortcuts
            </span>
            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50">
              Manage Job Postings
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Create new roles, view applicant counts, and trigger screening
              algorithms from the workspace.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Link href="/features/hr_recruitment" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 text-xs flex justify-center items-center gap-1.5 shadow-sm">
                Open Recruitment Pipeline
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link
              href={`/${orgId}/jobs`}
              target="_blank"
              className="block text-center text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 py-1.5 transition-colors"
            >
              View Public Careers Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
