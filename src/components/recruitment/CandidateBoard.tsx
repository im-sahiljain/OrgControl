"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, ArrowRight, Loader2, X, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./KanbanColumn";

interface CandidateBoardProps {
  jobs: any[];
  loadingJobs: boolean;
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  orgId: string;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  loadingCandidates: boolean;
  PIPELINE_STAGES: Array<{ id: string; name: string; color: string }>;
  stageQueries: Record<string, any>;
  dragOverStage: string | null;
  dndManager: any;
  movingIds: Set<string>;
  handleToggleSelect: (cand: any, e: React.MouseEvent) => void;
  setSelectedCandidateId: (id: string) => void;
  handleBatchScreen?: () => void;
  batchScreening?: boolean;
  batchProgress?: number;
  batchTotal?: number;
  batchCurrentName?: string;
  totalCandidates?: number;
  screenedCandidates?: number;
  unscreenedCandidates?: number;
  loadingJobCandidates?: boolean;
}

export const CandidateBoard: React.FC<CandidateBoardProps> = ({
  jobs,
  loadingJobs,
  selectedJobId,
  setSelectedJobId,
  orgId,
  selectedIds,
  setSelectedIds,
  loadingCandidates,
  PIPELINE_STAGES,
  stageQueries,
  dragOverStage,
  dndManager,
  movingIds,
  handleToggleSelect,
  setSelectedCandidateId,
  handleBatchScreen,
  batchScreening,
  batchProgress = 0,
  batchTotal = 0,
  batchCurrentName = "",
  totalCandidates,
  screenedCandidates = 0,
  unscreenedCandidates = 0,
  loadingJobCandidates = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Job selection dropdown & AI Screening Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs font-bold text-zinc-400 whitespace-nowrap">
            Filter by Position:
          </span>
          {loadingJobs ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          ) : jobs && jobs.length > 0 ? (
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-xs focus:outline-none font-bold focus:ring-1 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100 max-w-full">
                <SelectValue placeholder="Select Job" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]"
              >
                {jobs.map((job: any) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title} ({job.location})
                    {job.status !== "active" && " (Inactive)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-zinc-400 italic">
              No job postings created yet.
            </span>
          )}

          {selectedJobId && totalCandidates !== undefined && (
            <div className="flex items-center gap-3 text-sm font-bold text-zinc-450 bg-zinc-50 dark:bg-zinc-950/40 px-2.5 py-1 rounded-lg border border-zinc-200/60 dark:border-zinc-850 whitespace-nowrap">
              {loadingJobCandidates ? (
                <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading stats...
                </span>
              ) : (
                <>
                  <span>
                    Total:{" "}
                    <strong className="text-zinc-700 dark:text-zinc-300 font-extrabold">
                      {totalCandidates}
                    </strong>
                  </span>
                  <span className="text-zinc-200 dark:text-zinc-800">|</span>
                  <span className="text-violet-650 dark:text-violet-400">
                    Screened:{" "}
                    <strong className="font-extrabold">
                      {screenedCandidates}
                    </strong>
                  </span>
                  <span className="text-zinc-200 dark:text-zinc-800">|</span>
                  <span className="text-amber-600 dark:text-amber-500">
                    Unscreened:{" "}
                    <strong className="font-extrabold">
                      {unscreenedCandidates}
                    </strong>
                  </span>
                </>
              )}
            </div>
          )}

          {selectedJobId && (
            <Link
              href={`/${orgId}/${selectedJobId}/application`}
              target="_blank"
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 mt-1 sm:mt-0 sm:ml-2 w-fit"
            >
              Open Public Portal Page <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Batch progress display panel */}
      {batchScreening && (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xxs font-bold text-zinc-500">
            <span>AI Screening Pipeline Queue...</span>
            <div className="flex items-center gap-3">
              <span>
                {batchProgress} of {batchTotal} candidates (
                {Math.round(((batchProgress || 0) / (batchTotal || 1)) * 100)}%)
              </span>
            </div>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-violet-600 h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round(((batchProgress || 0) / (batchTotal || 1)) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 italic">
            Processing resume text and moving candidates to Screened stage for:{" "}
            <strong className="text-zinc-650 dark:text-zinc-300">
              {batchCurrentName || "Candidate..."}
            </strong>
          </p>
        </div>
      )}

      {/* Multi-select banner */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg text-xs">
          <div className="h-5 w-5 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
            {selectedIds.size}
          </div>
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            {selectedIds.size} candidate{selectedIds.size > 1 ? "s" : ""}{" "}
            selected — drag any selected card to move them all
          </span>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-blue-500 hover:text-blue-700 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Kanban Columns */}
      {loadingCandidates ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          <p className="text-xs text-zinc-400 font-bold">
            Loading candidate boards...
          </p>
        </div>
      ) : !selectedJobId ? (
        <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50">
          <Briefcase className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Create a Job Posting First
          </h4>
          <p className="text-xs text-zinc-450 mt-1 max-w-xs mx-auto">
            Use the "Create Posting" tab above to draft your first open role,
            then distribute it to candidates.
          </p>
        </div>
      ) : (
        <div className="flex md:grid md:grid-cols-6 gap-4 items-start overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory select-none w-full scrollbar-thin">
          {PIPELINE_STAGES.map((stage) => {
            const query = stageQueries[stage.id];
            const stageCandidates =
              query.data?.pages.flatMap((page: any) => page.data || []) || [];
            const totalCount = query.data?.pages[0]?.pagination?.total ?? 0;

            return (
              <KanbanColumn
                key={stage.id}
                stageId={stage.id}
                stageName={stage.name}
                stageColor={stage.color}
                totalCount={totalCount}
                isLoading={query.isLoading}
                isFetchingNextPage={query.isFetchingNextPage}
                isDragOver={dragOverStage === stage.id}
                candidates={stageCandidates}
                dndManager={dndManager}
                selectedIds={selectedIds}
                movingIds={movingIds}
                onToggleSelect={handleToggleSelect}
                onCardClick={(c) => setSelectedCandidateId(c._id)}
                onScrollEnd={() => {
                  if (query.hasNextPage && !query.isFetchingNextPage) {
                    query.fetchNextPage();
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
