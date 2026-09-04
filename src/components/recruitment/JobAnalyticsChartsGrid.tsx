"use client";

import React, { useState } from "react";
import {
  Calendar,
  Filter,
  Sparkles,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
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

interface JobAnalyticsChartsGridProps {
  isLoading: boolean;
  candidates?: any[];
  funnelChartData: any[];
  funnelStagesList: any[];
  maxFunnelCount: number;
  matchBinsData: any[];
  maxBinCount: number;
  binColorsMap: Record<string, string>;
  donutIngestionData: any[];
  screenedCount: number;
  unscreenedCount: number;
  totalCandidates: number;
}

export const JobAnalyticsChartsGrid: React.FC<JobAnalyticsChartsGridProps> = ({
  isLoading,
  candidates = [],
  funnelChartData,
  funnelStagesList,
  maxFunnelCount,
  matchBinsData,
  maxBinCount,
  binColorsMap,
  donutIngestionData,
  screenedCount,
  unscreenedCount,
  totalCandidates,
}) => {
  const [viewFunnel, setViewFunnel] = useState<"chart" | "lines">("chart");
  const [viewFit, setViewFit] = useState<"chart" | "lines">("chart");
  const [viewIngestion, setViewIngestion] = useState<"chart" | "lines">("chart");
  const [timeFilter, setTimeFilter] = useState<"all" | "7d" | "30d" | "90d">("all");

  // Dynamic chronological timeline data computed from candidates list
  const timelineData = React.useMemo(() => {
    if (!candidates || candidates.length === 0) {
      return [];
    }

    const now = new Date("2026-09-04T19:25:00.000Z"); // Reference time
    let cutoffTime = 0;
    if (timeFilter === "7d") {
      cutoffTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (timeFilter === "30d") {
      cutoffTime = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    } else if (timeFilter === "90d") {
      cutoffTime = now.getTime() - 90 * 24 * 60 * 60 * 1000;
    }

    const map: Record<string, { timestamp: number; date: string; applications: number }> = {};

    candidates.forEach((cand: any) => {
      const dateStr = cand.createdAt || cand.appliedDate || cand.created_at;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;

      if (cutoffTime > 0 && d.getTime() < cutoffTime) return;

      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = d.toLocaleString("default", {
        day: "numeric",
        month: "short",
      });

      if (!map[dateKey]) {
        map[dateKey] = {
          timestamp: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
          date: label,
          applications: 0,
        };
      }
      map[dateKey].applications += 1;
    });

    // Chronological sort: oldest on left, newest on right
    return Object.values(map).sort((a, b) => a.timestamp - b.timestamp);
  }, [candidates, timeFilter]);

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Timeline Chart */}
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-blue-600" />
            Application Submission Influx Over Time
          </h3>

          {/* Time range dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">Time Range:</span>
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
            <div className="h-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              <span className="text-xs text-zinc-400 font-medium">Loading time analytics data...</span>
            </div>
          ) : timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="jobTimelineColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={customTooltipStyle.contentStyle}
                  labelStyle={customTooltipStyle.labelStyle}
                  itemStyle={customTooltipStyle.itemStyle}
                />
                <Area type="monotone" dataKey="applications" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#jobTimelineColor)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <Calendar className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                No candidate applications recorded yet.
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                Application trends will automatically appear as candidates apply.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Funnel Velocity Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Filter className="h-4.5 w-4.5 text-violet-600" />
            Candidate Conversion Funnel Velocity
          </h3>
          <RenderTabSwitch activeView={viewFunnel} onChange={setViewFunnel} />
        </div>

        {viewFunnel === "chart" ? (
          <div className="h-64 w-full pt-2">
            {isLoading ? (
              <div className="h-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center space-y-2">
                <Loader2 className="h-6 w-6 text-violet-600 animate-spin" />
                <span className="text-xs text-zinc-400 font-medium">Loading funnel metrics...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelChartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                  <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={customTooltipStyle.contentStyle}
                    labelStyle={customTooltipStyle.labelStyle}
                    itemStyle={customTooltipStyle.itemStyle}
                  />
                  <Bar dataKey="candidates" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-2 min-h-[256px]">
            {funnelStagesList.map((stage, idx) => {
              const widthPct = Math.max(Math.round((stage.count / maxFunnelCount) * 100), 8);
              const conversionFromPrev = idx === 0 
                ? 100 
                : Math.round((stage.count / Math.max(funnelStagesList[idx - 1].count, 1)) * 100);

              return (
                <div key={stage.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-700 dark:text-zinc-300">{stage.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{stage.count} candidates</span>
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
            })}
          </div>
        )}
      </div>

      {/* AI Fit Histogram */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-blue-600" />
            Candidate Fit Score Distribution
          </h3>
          <RenderTabSwitch activeView={viewFit} onChange={setViewFit} />
        </div>

        {viewFit === "chart" ? (
          <div className="h-64 w-full pt-2">
            {isLoading ? (
              <div className="h-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center space-y-2">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                <span className="text-xs text-zinc-400 font-medium">Loading fit distribution...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchBinsData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={0} angle={-15} textAnchor="end" />
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
            {matchBinsData.map((bin) => {
              const pct = Math.max(Math.round((bin.count / maxBinCount) * 100), 5);
              const shareOfTotal = totalCandidates ? Math.round((bin.count / totalCandidates) * 100) : 0;
              return (
                <div key={bin.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${binColorsMap[bin.name]}`} />
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
            })}
          </div>
        )}
      </div>

      {/* Screening Donut Pie Chart */}
      <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <PieChartIcon className="h-4.5 w-4.5 text-amber-600" />
            AI Screening & Ingestion Ratio
          </h3>
          <RenderTabSwitch activeView={viewIngestion} onChange={setViewIngestion} />
        </div>

        {viewIngestion === "chart" ? (
          <div className="h-64 w-full flex items-center justify-center pt-2">
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
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4 text-center space-y-1">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 block">{screenedCount}</span>
              <span className="text-xs font-bold text-emerald-600 uppercase">Screened by AI</span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl p-4 text-center space-y-1">
              <AlertCircle className="h-6 w-6 text-amber-600 mx-auto mb-1" />
              <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 block">{unscreenedCount}</span>
              <span className="text-xs font-bold text-amber-600 uppercase">Pending Review</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
