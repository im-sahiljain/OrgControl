"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  BarChart3,
  Filter,
  Users,
  Sparkles,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

interface RecruitmentAnalyticsWidgetProps {
  orgId: string;
}

export default function RecruitmentAnalyticsWidget({
  orgId,
}: RecruitmentAnalyticsWidgetProps) {
  // View mode toggles for each chart card: "chart" | "lines"
  const [viewFunnel, setViewFunnel] = useState<"chart" | "lines">("chart");
  const [viewFit, setViewFit] = useState<"chart" | "lines">("chart");
  const [viewJobs, setViewJobs] = useState<"chart" | "lines">("chart");
  const [viewIngestion, setViewIngestion] = useState<"chart" | "lines">(
    "chart",
  );
  const [timeFilter, setTimeFilter] = useState<"all" | "7d" | "30d" | "90d">(
    "all",
  );

  // 1. Fetch Candidates List
  const { data: candidates = [], isLoading: loadingCandidates } = useQuery({
    queryKey: ["analytics-candidates", orgId],
    queryFn: async () => {
      const res = await axios.get(`/api/candidates?orgId=${orgId}&all=true`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  // 2. Fetch Jobs List
  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ["analytics-jobs", orgId],
    queryFn: async () => {
      const res = await axios.get(`/api/jobs?orgId=${orgId}`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  const isLoading = loadingCandidates || loadingJobs;

  // --- ANALYTICS CALCULATIONS ---
  const totalCandidates = candidates.length;

  // 1. Hiring Funnel Stage Counts
  const stageCounts = {
    applied: 0,
    screened: 0,
    interviewing: 0,
    offered: 0,
    hired: 0,
    rejected: 0,
  };

  // 2. AI Match Score Bins for Bar/Pie Chart
  const matchBinsData = [
    { name: "90%+ Top Fit", count: 0, color: "#10b981" },
    { name: "75-89% Strong", count: 0, color: "#8b5cf6" },
    { name: "50-74% Moderate", count: 0, color: "#f59e0b" },
    { name: "<50% Low Fit", count: 0, color: "#ef4444" },
    { name: "Unscreened", count: 0, color: "#6b7280" },
  ];

  let screenedCount = 0;
  let unscreenedCount = 0;

  // 3. Time Series Analytics (Application Volume by Date / Month)
  const now = new Date("2026-09-04T19:25:00.000Z");
  let cutoffTime = 0;
  if (timeFilter === "7d") {
    cutoffTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  } else if (timeFilter === "30d") {
    cutoffTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  } else if (timeFilter === "90d") {
    cutoffTime = now.getTime() - 90 * 24 * 60 * 60 * 1000;
  }

  const timeMap: Record<
    string,
    { timestamp: number; date: string; applications: number }
  > = {};

  candidates.forEach((cand: any) => {
    // Stage counts
    const st = (cand.stage || "applied").toLowerCase();
    if (st.includes("hired")) stageCounts.hired++;
    else if (st.includes("offer")) stageCounts.offered++;
    else if (st.includes("interview")) stageCounts.interviewing++;
    else if (st.includes("reject")) stageCounts.rejected++;
    else if (st.includes("screen")) stageCounts.screened++;
    else stageCounts.applied++;

    // Match score distribution
    if (cand.isAiScreened && typeof cand.matchScore === "number") {
      screenedCount++;
      if (cand.matchScore >= 90) matchBinsData[0].count++;
      else if (cand.matchScore >= 75) matchBinsData[1].count++;
      else if (cand.matchScore >= 50) matchBinsData[2].count++;
      else matchBinsData[3].count++;
    } else {
      unscreenedCount++;
      matchBinsData[4].count++;
    }

    // Date aggregation
    const dateStr = cand.createdAt || cand.appliedDate || cand.created_at;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        if (cutoffTime === 0 || d.getTime() >= cutoffTime) {
          const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const monthKey = d.toLocaleString("default", {
            day: "numeric",
            month: "short",
          });
          if (!timeMap[dateKey]) {
            timeMap[dateKey] = {
              timestamp: new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
              ).getTime(),
              date: monthKey,
              applications: 0,
            };
          }
          timeMap[dateKey].applications += 1;
        }
      }
    }
  });

  // Prepare time series chart data sorted chronologically (oldest on left, newest on right)
  const timeSeriesData = Object.values(timeMap).sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  // Real timeline data
  const displayTimelineData = timeSeriesData;

  // Funnel Data
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

  // Job Posting Application Volume Data
  const jobApplicantMap: Record<string, number> = {};
  candidates.forEach((cand: any) => {
    if (cand.jobId) {
      jobApplicantMap[cand.jobId] = (jobApplicantMap[cand.jobId] || 0) + 1;
    }
  });

  const rawJobAnalytics = jobs
    .map((j: any) => ({
      title: j.title,
      count: jobApplicantMap[j._id] || 0,
    }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  const maxJobApplicants = Math.max(
    ...rawJobAnalytics.map((j: any) => j.count),
    1,
  );

  const jobVolumeChartData = rawJobAnalytics.map((j: any) => ({
    name: j.title.length > 18 ? `${j.title.substring(0, 16)}...` : j.title,
    fullTitle: j.title,
    applicants: j.count,
  }));

  // Donut chart data for AI Ingestion Status
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

  // Tab Switch Component
  const RenderTabSwitch = ({
    activeView,
    onChange,
  }: {
    activeView: "chart" | "lines";
    onChange: (view: "chart" | "lines") => void;
  }) => (
    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xxs font-bold">
      <button
        onClick={() => onChange("chart")}
        className={`px-2.5 py-1 rounded-md transition-all ${
          activeView === "chart"
            ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        Graph
      </button>
      <button
        onClick={() => onChange("lines")}
        className={`px-2.5 py-1 rounded-md transition-all ${
          activeView === "lines"
            ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        Progress Bars
      </button>
    </div>
  );

  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: "#09090b",
      border: "1px solid #27272a",
      borderRadius: "10px",
      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.6)",
      padding: "8px 12px",
    },
    labelStyle: {
      color: "#f8fafc",
      fontWeight: 700,
      fontSize: "12px",
      marginBottom: "3px",
    },
    itemStyle: {
      color: "#e2e8f0",
      fontWeight: 600,
      fontSize: "12px",
      padding: "1px 0",
    },
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Recruitment Analytics & Talent Insights
          </h2>
          <p className="text-xs text-zinc-500">
            Switch seamlessly between interactive graphs and progress bar views.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900">
            {totalCandidates} Candidates Analyzed
          </span>
        </div>
      </div>

      {/* Grid of Interactive Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidate Application Volume Over Time Card */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-blue-600" />
              Candidate Application Volume Over Time
            </h3>

            {/* Time range dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">
                Time Range:
              </span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="h-8 px-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="7d">1 Week</option>
                <option value="30d">1 Month</option>
                <option value="90d">3 Months</option>
              </select>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {isLoading ? (
              <div className="h-full bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ) : displayTimelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={displayTimelineData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="timelineColor"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#2563eb"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#374151"
                    opacity={0.15}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={customTooltipStyle.contentStyle}
                    labelStyle={customTooltipStyle.labelStyle}
                    itemStyle={customTooltipStyle.itemStyle}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#timelineColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <Calendar className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  No candidate applications recorded yet.
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Application timelines will automatically populate as
                  candidates apply.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 1. Pipeline Funnel Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Filter className="h-4.5 w-4.5 text-violet-600" />
              Pipeline Funnel Velocity
            </h3>
            <RenderTabSwitch activeView={viewFunnel} onChange={setViewFunnel} />
          </div>

          {viewFunnel === "chart" ? (
            <div className="h-64 w-full pt-2">
              {isLoading ? (
                <div className="h-full bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={funnelChartData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#374151"
                      opacity={0.15}
                    />
                    <XAxis
                      dataKey="stage"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={customTooltipStyle.contentStyle}
                      labelStyle={customTooltipStyle.labelStyle}
                      itemStyle={customTooltipStyle.itemStyle}
                    />
                    <Bar
                      dataKey="candidates"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-2 min-h-[256px]">
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-full"
                    />
                  ))}
                </div>
              ) : (
                funnelStagesList.map((stage, idx) => {
                  const widthPct = Math.max(
                    Math.round((stage.count / maxFunnelCount) * 100),
                    8,
                  );
                  const conversionFromPrev =
                    idx === 0
                      ? 100
                      : Math.round(
                          (stage.count /
                            Math.max(funnelStagesList[idx - 1].count, 1)) *
                            100,
                        );

                  return (
                    <div key={stage.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {stage.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {stage.count} candidates
                          </span>
                          {idx > 0 && (
                            <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                              {conversionFromPrev}% conv.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${stage.color} transition-all duration-500 rounded-full`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 2. AI Match Score Distribution Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-blue-600" />
              AI Match Score Distribution
            </h3>
            <RenderTabSwitch activeView={viewFit} onChange={setViewFit} />
          </div>

          {viewFit === "chart" ? (
            <div className="h-64 w-full pt-2">
              {isLoading ? (
                <div className="h-full bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={matchBinsData}
                    margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#374151"
                      opacity={0.15}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={customTooltipStyle.contentStyle}
                      labelStyle={customTooltipStyle.labelStyle}
                      itemStyle={customTooltipStyle.itemStyle}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {matchBinsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-2 min-h-[256px]">
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-7 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-full"
                    />
                  ))}
                </div>
              ) : (
                matchBinsData.map((bin) => {
                  const pct = Math.max(
                    Math.round((bin.count / maxBinCount) * 100),
                    5,
                  );
                  const shareOfTotal = totalCandidates
                    ? Math.round((bin.count / totalCandidates) * 100)
                    : 0;
                  return (
                    <div key={bin.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${binColorsMap[bin.name]}`}
                          />
                          {bin.name}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {bin.count} ({shareOfTotal}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full ${binColorsMap[bin.name]} transition-all duration-500 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 3. Job Volume Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-emerald-600" />
              Applicants per Active Job
            </h3>
            <RenderTabSwitch activeView={viewJobs} onChange={setViewJobs} />
          </div>

          {viewJobs === "chart" ? (
            <div className="h-64 w-full pt-2">
              {isLoading ? (
                <div className="h-full bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ) : jobVolumeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={jobVolumeChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#374151"
                      opacity={0.15}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={customTooltipStyle.contentStyle}
                      labelStyle={customTooltipStyle.labelStyle}
                      itemStyle={customTooltipStyle.itemStyle}
                    />
                    <Bar
                      dataKey="applicants"
                      fill="#10b981"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-16 text-zinc-400 text-xs italic">
                  No job postings available.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3.5 pt-2 min-h-[256px]">
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-full"
                    />
                  ))}
                </div>
              ) : rawJobAnalytics.length > 0 ? (
                rawJobAnalytics.map((job: any) => {
                  const widthPct = Math.max(
                    Math.round((job.count / maxJobApplicants) * 100),
                    10,
                  );
                  return (
                    <div key={job.title} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                          {job.title}
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {job.count} applicants
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-zinc-400 text-xs italic">
                  No active job posting analytics available.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. AI Ingestion Status Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <PieChartIcon className="h-4.5 w-4.5 text-amber-600" />
              AI Screening Ingestion Status
            </h3>
            <RenderTabSwitch
              activeView={viewIngestion}
              onChange={setViewIngestion}
            />
          </div>

          {viewIngestion === "chart" ? (
            <div className="h-64 w-full flex items-center justify-center pt-2">
              {isLoading ? (
                <div className="h-full bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutIngestionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {donutIngestionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={customTooltipStyle.contentStyle}
                      labelStyle={customTooltipStyle.labelStyle}
                      itemStyle={customTooltipStyle.itemStyle}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="flex flex-col justify-between space-y-4 min-h-[256px]">
              <div className="grid grid-cols-2 gap-4 my-auto pt-2">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4 text-center space-y-1">
                  <div className="flex justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 block">
                    {screenedCount}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Screened by AI
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-medium">
                    {totalCandidates
                      ? Math.round((screenedCount / totalCandidates) * 100)
                      : 0}
                    % of candidate pool
                  </span>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl p-4 text-center space-y-1">
                  <div className="flex justify-center text-amber-600 dark:text-amber-400 mb-1">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 block">
                    {unscreenedCount}
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Pending Review
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-medium">
                    {totalCandidates
                      ? Math.round((unscreenedCount / totalCandidates) * 100)
                      : 0}
                    % requiring evaluation
                  </span>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-500 flex justify-between items-center">
                <span>Overall Evaluation Coverage Rate:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {totalCandidates
                    ? Math.round((screenedCount / totalCandidates) * 100)
                    : 0}
                  % Completed
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
