"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Building, MapPin, Clock } from "lucide-react";

interface JobAnalyticsHeaderProps {
  job: any;
  loadingJob: boolean;
  isLoading: boolean;
  totalCandidates: number;
  screenedCount: number;
  avgMatchScore: number;
  orgId?: string;
  jobId: string;
}

export const JobAnalyticsHeader: React.FC<JobAnalyticsHeaderProps> = ({
  job,
  loadingJob,
  isLoading,
  totalCandidates,
  screenedCount,
  avgMatchScore,
  orgId,
  jobId,
}) => {
  return (
    <div className="space-y-6">
      {/* Navigation & Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/recruitment/postings"
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </Link>
          <div>
            <span className="text-xxs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
              Job Posting Analytics
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {job?.title || "Job Posting Detailed Analytics"}
            </h1>
          </div>
        </div>

        {orgId && (
          <Link
            href={`/${orgId}/${jobId}/application`}
            target="_blank"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs"
          >
            View Public Apply Portal →
          </Link>
        )}
      </div>

      {/* Job Details Meta Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        {loadingJob ? (
          <div className="space-y-3 w-full animate-pulse">
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
            <div className="h-4 bg-zinc-150 dark:bg-zinc-850 rounded w-2/3" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                <Building className="h-4 w-4 text-blue-600" />
                {job?.department || "Department"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-zinc-400" />
                {job?.location || "Remote"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-zinc-400" />
                {job?.type || "Full-time"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              {job?.description?.substring(0, 160) || "Job vacancy configuration & metrics."}...
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-zinc-150 dark:border-zinc-800 pt-4 md:pt-0 md:pl-6 text-center">
          <div>
            <span className="text-xxs font-bold text-zinc-400 uppercase tracking-wider block">Applicants</span>
            {isLoading ? (
              <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-12 mx-auto animate-pulse mt-1" />
            ) : (
              <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">{totalCandidates}</span>
            )}
          </div>
          <div>
            <span className="text-xxs font-bold text-zinc-400 uppercase tracking-wider block">Screened</span>
            {isLoading ? (
              <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-12 mx-auto animate-pulse mt-1" />
            ) : (
              <span className="text-xl font-extrabold text-emerald-600">{screenedCount}</span>
            )}
          </div>
          <div>
            <span className="text-xxs font-bold text-zinc-400 uppercase tracking-wider block">Avg Match</span>
            {isLoading ? (
              <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-12 mx-auto animate-pulse mt-1" />
            ) : (
              <span className="text-xl font-extrabold text-violet-600">{avgMatchScore}%</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
