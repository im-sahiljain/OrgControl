"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
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
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react";

interface BoardAnalyticsChartsProps {
  orgId: string;
  selectedJobId: string;
  isBatchScreening?: boolean;
}

const SKILL_COLORS = [
  "#10b981", // Emerald Green
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
  "#64748b", // Slate
];

const customTooltipStyle = {
  contentStyle: {
    backgroundColor: "#09090b",
    borderColor: "#27272a",
    borderRadius: "0.5rem",
    fontSize: "12px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
    padding: "8px 12px",
  },
  itemStyle: { color: "#38bdf8", fontWeight: 600 },
  labelStyle: { color: "#ffffff", fontWeight: 700, marginBottom: "2px" },
};

export const BoardAnalyticsCharts: React.FC<BoardAnalyticsChartsProps> = ({
  orgId,
  selectedJobId,
  isBatchScreening = false,
}) => {
  // Fetch candidate dataset for real-time analytics
  const { data: candidates = [] } = useQuery({
    queryKey: ["analytics-candidates", orgId, selectedJobId],
    queryFn: async () => {
      if (!orgId) return [];
      const url =
        selectedJobId && selectedJobId !== "all"
          ? `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&all=true`
          : `/api/candidates?orgId=${orgId}&all=true`;
      const res = await axios.get(url);
      return res.data.data || [];
    },
    enabled: !!orgId,
    refetchInterval: isBatchScreening ? 2000 : false, // Auto-poll every 2s while screening is actively running
  });

  // Calculate Real-Time Funnel Stage Data
  const stageData = useMemo(() => {
    const counts = {
      applied: 0,
      screened: 0,
      interviewing: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
    };

    candidates.forEach((c: any) => {
      const st = (c.stage || "applied").toLowerCase();
      if (st in counts) {
        counts[st as keyof typeof counts]++;
      }
    });

    return [
      { stage: "Applied", count: counts.applied, color: "#3b82f6" },
      { stage: "Screened", count: counts.screened, color: "#a855f7" },
      { stage: "Interviewing", count: counts.interviewing, color: "#f59e0b" },
      { stage: "Offered", count: counts.offered, color: "#10b981" },
      { stage: "Hired", count: counts.hired, color: "#0d9488" },
      { stage: "Rejected", count: counts.rejected, color: "#f43f5e" },
    ];
  }, [candidates]);

  // Calculate Match Score Quality Tiers matching screenshot
  const matchScoreTiers = useMemo(() => {
    let tier90Plus = 0; // 90%+ Top Fit
    let tier75To89 = 0; // 75-89% Strong
    let tier50To74 = 0; // 50-74% Moderate
    let tierBelow50 = 0; // <50% Low Fit
    let unscreened = candidates.filter((c: any) => !c.isAiScreened).length;

    const screenedCands = candidates.filter((c: any) => c.isAiScreened);

    screenedCands.forEach((c: any) => {
      const score = c.matchScore || 0;
      if (score >= 90) tier90Plus++;
      else if (score >= 75) tier75To89++;
      else if (score >= 50) tier50To74++;
      else tierBelow50++;
    });

    return [
      { name: "90%+ Top Fit", value: tier90Plus, color: "#10b981" },
      { name: "75-89% Strong", value: tier75To89, color: "#8b5cf6" },
      { name: "50-74% Moderate", value: tier50To74, color: "#f59e0b" },
      { name: "<50% Low Fit", value: tierBelow50, color: "#f43f5e" },
      { name: "Unscreened", value: unscreened, color: "#94a3b8" },
    ].filter((item) => item.value > 0);
  }, [candidates]);

  // Extract Top Candidate Skills
  const topSkillsData = useMemo(() => {
    const skillCounts: Record<string, number> = {};
    candidates.forEach((c: any) => {
      if (Array.isArray(c.skills)) {
        c.skills.forEach((skill: string) => {
          const cleanSkill = skill.trim();
          if (cleanSkill) {
            skillCounts[cleanSkill] = (skillCounts[cleanSkill] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [candidates]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = candidates.length;
    const screened = candidates.filter((c: any) => c.isAiScreened).length;
    const screenedRatio = total > 0 ? Math.round((screened / total) * 100) : 0;

    const screenedScores: number[] = candidates
      .filter((c: any) => c.isAiScreened && typeof c.matchScore === "number")
      .map((c: any) => Number(c.matchScore) || 0);

    const avgScore =
      screenedScores.length > 0
        ? Math.round(
            screenedScores.reduce((a: number, b: number) => a + b, 0) / screenedScores.length
          )
        : 0;

    return { total, screened, unscreened: total - screened, screenedRatio, avgScore };
  }, [candidates]);

  return (
    <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 animate-fade-in">
      {/* Header section with live indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Board Real-Time Analytics
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Live pipeline metrics, skill distributions, and AI screening match quality.
          </p>
        </div>

        {isBatchScreening && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 rounded-full text-xs text-violet-700 dark:text-violet-300 font-semibold animate-pulse">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span>AI Screening Live Updating...</span>
          </div>
        )}
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Total Candidates</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {metrics.total}
          </p>
          <p className="text-[10px] text-zinc-400">In selected pipeline</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Screening Complete</span>
            <BrainCircuit className="h-4 w-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {metrics.screenedRatio}%
            </p>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              ({metrics.screened}/{metrics.total})
            </span>
          </div>
          <p className="text-[10px] text-zinc-400">{metrics.unscreened} pending screening</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Avg Match Score</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.avgScore}%
          </p>
          <p className="text-[10px] text-zinc-400">Across screened profiles</p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Top Match Ratio</span>
            <TrendingUp className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
            {matchScoreTiers.find((t) => t.name.includes("90%"))?.value || 0}
          </p>
          <p className="text-[10px] text-zinc-400">Candidates with 90%+ match</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Pipeline Stage Distribution */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" />
              Pipeline Stage Breakdown
            </h3>
            <span className="text-[11px] text-zinc-400 font-medium">
              Candidates per stage
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  contentStyle={customTooltipStyle.contentStyle}
                  itemStyle={customTooltipStyle.itemStyle}
                  labelStyle={customTooltipStyle.labelStyle}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Match Score Tier Quality Distribution */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-emerald-500" />
              AI Match Quality Tiers
            </h3>
          </div>

          {matchScoreTiers.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-zinc-400 italic">
              No screened candidates yet
            </div>
          ) : (
            <div className="h-64 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={matchScoreTiers}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {matchScoreTiers.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={customTooltipStyle.contentStyle}
                    itemStyle={customTooltipStyle.itemStyle}
                    labelStyle={customTooltipStyle.labelStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 text-[10px]">
                {matchScoreTiers.map((t) => (
                  <div key={t.name} className="flex items-center gap-1">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {t.name}: <strong>{t.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart 3: Top Candidate Skills Breakdown */}
        {topSkillsData.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
                Top Identified Skills Across Candidates
              </h3>
              <span className="text-[11px] text-zinc-400 font-medium">
                Extracted by Gemini AI
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topSkillsData}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.15} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    contentStyle={customTooltipStyle.contentStyle}
                    itemStyle={customTooltipStyle.itemStyle}
                    labelStyle={customTooltipStyle.labelStyle}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {topSkillsData.map((_, index) => (
                      <Cell
                        key={`skill-${index}`}
                        fill={SKILL_COLORS[index % SKILL_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
