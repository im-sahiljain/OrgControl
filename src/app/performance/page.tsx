"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { TrendingUp, Plus, Award, Star, StarOff, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RootState } from "../reduxToolkit/store";

export default function PerformancePage() {
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const userRole = user?.role || "employee";

  const [goals, setGoals] = useState<any[]>([
    { id: 1, title: "Optimize DB Connection Limits", desc: "Reuse cached connections for cold-start performance", progress: 85, weight: "High", owner: "Aarav Sharma" },
    { id: 2, title: "Directory Search Auto-indexing", desc: "Enable full-text autocomplete search indexes", progress: 60, weight: "Medium", owner: "Aarav Sharma" },
    { id: 3, title: "Configure Cloudinary API", desc: "Integrate base64 image hosting upload signature routes", progress: 100, weight: "High", owner: "Aarav Sharma" },
    { id: 4, title: "Upgrade RAG Vectors in Copilot", desc: "Create Atlas Semantic indexing layers", progress: 40, weight: "High", owner: "Ananya Patel" },
  ]);

  const [newGoalTitle, setNewGoalTitle] = useState<string>("");
  const [newGoalWeight, setNewGoalWeight] = useState<string>("Medium");

  const handleAddGoal = () => {
    if (!newGoalTitle) return;
    const newGoal = {
      id: Date.now(),
      title: newGoalTitle,
      desc: "Custom OKR parameter logged by organization admin standards.",
      progress: 0,
      weight: newGoalWeight,
      owner: "Aarav Sharma",
    };
    setGoals([...goals, newGoal]);
    setNewGoalTitle("");
  };

  // ----------------------------------------------------
  // ORG ADMIN VIEW (MANAGER OKR WORKSPACE)
  // ----------------------------------------------------
  if (userRole === "org_admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Performance & OKR Supervisor
          </h1>
          <p className="text-sm text-zinc-500">
            Establish team-wide key results, evaluate peer feedback scores, and calibrate final reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Global workforce goals */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Workforce Goal Tracking
              </h3>
              <div className="space-y-5">
                {goals.map((g) => (
                  <div key={g.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">{g.title}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">Assigned to: {g.owner} | {g.desc}</p>
                      </div>
                      <span className="text-xxs px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full font-bold">
                        {g.weight} Weight
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-zinc-500">
                        <span>Completion percentage</span>
                        <span>{g.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${g.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Add Team Goal */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Establish New Target
              </h3>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Goal Title"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                />
                <select
                  value={newGoalWeight}
                  onChange={(e) => setNewGoalWeight(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <Button onClick={handleAddGoal} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Add Team Goal
                </Button>
              </div>
            </div>

            {/* Aggregated ratings */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Team Calibration Score
              </h3>
              <p className="text-xs text-zinc-550">
                Average appraisal calibration score for the current review period.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 text-zinc-250 dark:text-zinc-700" />
                </div>
                <span className="text-sm font-bold">4.2 / 5.0 Average</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // EMPLOYEE VIEW (SELF-SERVICE APPRAISALS)
  // ----------------------------------------------------
  const personalGoals = goals.filter((g) => g.owner === "John Doe");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          My Objectives & Key Results (OKRs)
        </h1>
        <p className="text-sm text-zinc-500">
          Review your personal goals, update completion percentages, and write self-assessment sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal OKRs */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            My OKR Performance
          </h3>
          <div className="space-y-5">
            {personalGoals.map((g) => (
              <div key={g.id} className="p-4 bg-zinc-50 dark:bg-zinc-955 border border-zinc-100 dark:border-zinc-850 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">{g.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{g.desc}</p>
                  </div>
                  <span className="text-xxs px-2.5 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 rounded-full font-bold">
                    {g.weight} Priority
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-500">
                    <span>Self-evaluated Progress</span>
                    <span>{g.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={g.progress}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setGoals((prev) =>
                        prev.map((item) => (item.id === g.id ? { ...item, progress: val } : item))
                      );
                    }}
                    className="w-full accent-blue-600 bg-zinc-200 rounded-lg cursor-pointer h-1.5"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Self assessment */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Cycle Self-Assessment
            </h3>
            <p className="text-xs text-zinc-500">
              Submit your H1 performance accomplishments directly to your reporting manager.
            </p>
            <textarea
              placeholder="List key highlights or speed achievements..."
              rows={4}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100"
            />
            <Button
              onClick={() => alert("Self-assessment submitted successfully to HR Calibration Roster.")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Appraisal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
