"use client";

import React from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { DepartmentFeature, AccessLevel } from "@/lib/departmentRegistry";
import { DataScope } from "@/lib/roleResolver";

interface DepartmentFeatureCardProps {
  feature: DepartmentFeature;
  accessLevel: AccessLevel;
  dataScope: DataScope;
  roleLabel: string;
}

export default function DepartmentFeatureCard({
  feature,
  accessLevel,
  dataScope,
  roleLabel,
}: DepartmentFeatureCardProps) {
  // Dynamically load the icon from lucide-react
  const Icon = (LucideIcons as any)[feature.icon] || LucideIcons.LayoutGrid;

  // Access level visual configurations
  const accessConfig = {
    full: {
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
      dot: "bg-emerald-500",
      label: "Full Access",
      buttonText: "Manage",
    },
    operational: {
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
      label: "Operational",
      buttonText: "Open",
    },
    view_only: {
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      dot: "bg-blue-500",
      label: "View Only",
      buttonText: "View",
    },
    none: {
      color: "text-zinc-400 bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800",
      dot: "bg-zinc-300",
      label: "No Access",
      buttonText: "Locked",
    },
  };

  const config = accessConfig[accessLevel] || accessConfig.none;

  // Data scope label mappings
  const scopeLabels = {
    department_wide: "All Teams",
    own_team: "Your Team",
    self_only: "Personal",
  };

  return (
    <div className={`flex flex-col border rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md bg-white dark:bg-zinc-900 ${
      accessLevel === "none" ? "opacity-60 grayscale-[0.5]" : "border-zinc-200 dark:border-zinc-800"
    }`}>
      {/* Header section with icon, title, and access badge */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm line-clamp-1">
              {feature.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
              {feature.description}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata Section: Role, Scope, Access Level */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4 bg-zinc-50/30 dark:bg-zinc-950/30">
        <div className="space-y-2">
          {/* Role badge */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Your Role</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">
              {roleLabel}
            </span>
          </div>

          {/* Data Scope */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Data Scope</span>
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              {scopeLabels[dataScope]}
            </span>
          </div>

          {/* Access Level Badge */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Access Level</span>
            <div className="flex items-center gap-1.5 font-medium">
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              <span className={config.color.split(" ")[0]}>{config.label}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {accessLevel === "none" ? (
          <button
            disabled
            className="w-full py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800/50 dark:text-zinc-600"
          >
            {config.buttonText}
          </button>
        ) : (
          <Link
            href={`/features/${feature.id}`}
            className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              accessLevel === "full"
                ? "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 shadow-sm"
                : accessLevel === "operational"
                ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
                : "bg-transparent border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {config.buttonText}
            <LucideIcons.ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
