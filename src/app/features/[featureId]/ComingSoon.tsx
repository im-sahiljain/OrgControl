"use client";

import React from "react";
import Link from "next/link";
import { Hammer, ArrowLeft, Construction } from "lucide-react";
import { DepartmentFeature } from "@/lib/departmentRegistry";

export default function ComingSoon({ feature }: { feature: DepartmentFeature }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full">
            <Construction className="h-10 w-10" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {feature.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            This module is currently under active development. Our engineering team is building the end-to-end functionality for the {feature.name} workspace.
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 text-xs font-semibold text-zinc-500 text-left border border-zinc-150 dark:border-zinc-850">
          <span className="block mb-1 text-zinc-400 uppercase tracking-wider text-xxs">Module Details</span>
          <span className="block text-zinc-700 dark:text-zinc-300">ID: {feature.id}</span>
          <span className="block text-zinc-700 dark:text-zinc-300">Category: {feature.category}</span>
        </div>

        <Link 
          href="/" 
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
