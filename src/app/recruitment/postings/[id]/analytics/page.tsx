"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import type { RootState } from "@/app/reduxToolkit/store";
import { JobAnalyticsHeader } from "@/components/recruitment/JobAnalyticsHeader";
import { JobAnalyticsChartsGrid } from "@/components/recruitment/JobAnalyticsChartsGrid";
import { TopCandidatesTable } from "@/components/recruitment/TopCandidatesTable";

export default function JobAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: jobId } = use(params);
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  // 1. Fetch Single Job Details
  const { data: job, isLoading: loadingJob } = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: async () => {
      const res = await axios.get(`/api/jobs/${jobId}`);
      return res.data.data;
    },
    enabled: !!jobId,
  });

  // 2. Fetch Candidates for this specific Job
  const { data: candidates = [], isLoading: loadingCandidates } = useQuery({
    queryKey: ["job-candidates", orgId, jobId],
    queryFn: async () => {
      if (!orgId || !jobId) return [];
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&jobId=${jobId}&all=true`,
      );
      return res.data.data || [];
    },
    enabled: !!orgId && !!jobId,
  });

  const isLoading = loadingJob || loadingCandidates;

  // --- ANALYTICS COMPUTATION ---
  const totalCandidates = candidates.length;

  const stageCounts = {
    applied: 0,
    screened: 0,
    interviewing: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
  };

  const matchBinsData = [
    { name: "90%+ Top Fit", count: 0, color: "#10b981" },
    { name: "75-89% Strong", count: 0, color: "#8b5cf6" },
    { name: "50-74% Moderate", count: 0, color: "#f59e0b" },
    { name: "<50% Low Fit", count: 0, color: "#ef4444" },
    { name: "Unscreened", count: 0, color: "#6b7280" },
  ];

  let screenedCount = 0;
  let unscreenedCount = 0;
  let totalScore = 0;

  const timeMap: Record<string, number> = {};

  candidates.forEach((cand: any) => {
    const st = (cand.stage || "applied").toLowerCase();
    if (st.includes("hired")) stageCounts.hired++;
    else if (st.includes("offer")) stageCounts.offered++;
    else if (st.includes("interview")) stageCounts.interviewing++;
    else if (st.includes("reject")) stageCounts.rejected++;
    else if (st.includes("screen")) stageCounts.screened++;
    else stageCounts.applied++;

    if (cand.isAiScreened && typeof cand.matchScore === "number") {
      screenedCount++;
      totalScore += cand.matchScore;
      if (cand.matchScore >= 90) matchBinsData[0].count++;
      else if (cand.matchScore >= 75) matchBinsData[1].count++;
      else if (cand.matchScore >= 50) matchBinsData[2].count++;
      else matchBinsData[3].count++;
    } else {
      unscreenedCount++;
      matchBinsData[4].count++;
    }

    const dateStr = cand.createdAt || cand.appliedDate || cand.created_at;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const key = d.toLocaleString("default", {
          month: "short",
          day: "numeric",
        });
        timeMap[key] = (timeMap[key] || 0) + 1;
      }
    }
  });

  const avgMatchScore = screenedCount
    ? Math.round(totalScore / screenedCount)
    : 0;

  const timeSeriesData = Object.entries(timeMap).map(([date, count]) => ({
    date,
    applications: count,
  }));

  const displayTimelineData = timeSeriesData;
  const maxTimelineCount = Math.max(
    ...displayTimelineData.map((t) => t.applications),
    1,
  );

  const funnelStagesList = [
    {
      label: "Applied",
      count:
        stageCounts.applied +
        stageCounts.screened +
        stageCounts.interviewing +
        stageCounts.offered +
        stageCounts.hired +
        stageCounts.rejected,
      color: "bg-blue-500",
    },
    {
      label: "AI Screened",
      count:
        stageCounts.screened +
        stageCounts.interviewing +
        stageCounts.offered +
        stageCounts.hired,
      color: "bg-violet-500",
    },
    {
      label: "Interviewing",
      count: stageCounts.interviewing + stageCounts.offered + stageCounts.hired,
      color: "bg-amber-500",
    },
    {
      label: "Offered",
      count: stageCounts.offered + stageCounts.hired,
      color: "bg-emerald-500",
    },
    { label: "Hired", count: stageCounts.hired, color: "bg-teal-500" },
  ];
  const maxFunnelCount = Math.max(funnelStagesList[0].count, 1);

  const funnelChartData = funnelStagesList.map((s) => ({
    stage: s.label,
    candidates: s.count,
  }));

  const donutIngestionData = [
    { name: "Screened by AI", value: screenedCount, color: "#10b981" },
    { name: "Pending Review", value: unscreenedCount, color: "#f59e0b" },
  ];

  const binColorsMap: Record<string, string> = {
    "90%+ Top Fit": "bg-emerald-500",
    "75-89% Strong": "bg-purple-500",
    "50-74% Moderate": "bg-amber-500",
    "<50% Low Fit": "bg-rose-500",
    Unscreened: "bg-zinc-400 dark:bg-zinc-600",
  };
  const maxBinCount = Math.max(...matchBinsData.map((b) => b.count), 1);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Header Component */}
      <JobAnalyticsHeader
        job={job}
        loadingJob={loadingJob}
        isLoading={isLoading}
        totalCandidates={totalCandidates}
        screenedCount={screenedCount}
        avgMatchScore={avgMatchScore}
        orgId={orgId}
        jobId={jobId}
      />

      {/* 2. Top Candidates Table Component */}
      <TopCandidatesTable candidates={candidates} isLoading={isLoading} />

      {/* 3. Charts Grid Component */}
      <JobAnalyticsChartsGrid
        isLoading={isLoading}
        candidates={candidates}
        funnelChartData={funnelChartData}
        funnelStagesList={funnelStagesList}
        maxFunnelCount={maxFunnelCount}
        matchBinsData={matchBinsData}
        maxBinCount={maxBinCount}
        binColorsMap={binColorsMap}
        donutIngestionData={donutIngestionData}
        screenedCount={screenedCount}
        unscreenedCount={unscreenedCount}
        totalCandidates={totalCandidates}
      />
    </div>
  );
}
