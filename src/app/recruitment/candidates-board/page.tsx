"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Users, AlertCircle, Sparkles } from "lucide-react";
import type { RootState } from "@/app/reduxToolkit/store";
import { startGlobalScreening } from "@/app/reduxToolkit/slice";
import toast from "react-hot-toast";
import { DragDropManager, PointerSensor } from "@dnd-kit/dom";
import { CandidateBoard } from "@/components/recruitment/CandidateBoard";
import { CandidateDetailsDrawer } from "@/components/recruitment/CandidateDetailsDrawer";
import { Button } from "@/components/ui/button";

const PIPELINE_STAGES = [
  {
    id: "applied",
    name: "Applied",
    color:
      "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50",
  },
  {
    id: "screened",
    name: "Screened",
    color:
      "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/50",
  },
  {
    id: "interviewing",
    name: "Interviewing",
    color:
      "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50",
  },
  {
    id: "offered",
    name: "Offered",
    color:
      "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50",
  },
  {
    id: "hired",
    name: "Hired",
    color:
      "bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-900/50",
  },
  {
    id: "rejected",
    name: "Rejected",
    color:
      "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900/50",
  },
];

export default function CandidatesBoardPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  const isBatchScreening = useSelector(
    (state: RootState) => state.employeeUI.isBatchScreening,
  );
  const batchProgress = useSelector(
    (state: RootState) => state.employeeUI.batchProgress,
  );
  const batchTotal = useSelector(
    (state: RootState) => state.employeeUI.batchTotal,
  );
  const batchCurrentName = useSelector(
    (state: RootState) => state.employeeUI.batchCurrentName,
  );

  const [confirmRescreenModal, setConfirmRescreenModal] = useState<{
    open: boolean;
    candidates: any[];
  }>({ open: false, candidates: [] });

  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );

  // Fetch all candidates for the selected job to calculate stats
  const { data: candidatesStatsResponse, isLoading: loadingJobCandidates } =
    useQuery({
      queryKey: ["recruitment-candidates", orgId, selectedJobId, "all-job"],
      queryFn: async () => {
        if (!orgId || !selectedJobId || selectedJobId === "all")
          return { data: [], total: 0 };
        const res = await axios.get(
          `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&all=true`,
        );
        return {
          data: res.data.data || [],
          total: res.data.pagination?.total ?? (res.data.data || []).length,
        };
      },
      enabled: !!orgId && !!selectedJobId && selectedJobId !== "all",
    });

  const jobCandidates = candidatesStatsResponse?.data || [];
  const totalCandidates =
    candidatesStatsResponse?.total ?? jobCandidates.length;
  const screenedCandidates = jobCandidates.filter(
    (c: any) => c.isAiScreened,
  ).length;
  const unscreenedCandidates = jobCandidates.filter(
    (c: any) => !c.isAiScreened,
  ).length;

  // Batch AI screening handler
  const handleBatchScreen = async () => {
    if (!selectedJobId || !orgId) return;

    try {
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&all=true`,
      );
      const allCandidates = res.data.data || [];
      const unscreened = allCandidates.filter((c: any) => !c.isAiScreened);

      if (unscreened.length === 0) {
        if (allCandidates.length === 0) {
          toast("No candidates found for this job posting.");
          return;
        }

        setConfirmRescreenModal({ open: true, candidates: allCandidates });
      } else {
        dispatch(
          startGlobalScreening({
            candidates: unscreened,
            jobId: selectedJobId,
          }),
        );
        toast.success(
          `Started background AI screening for ${unscreened.length} candidate(s)! You can switch tabs.`,
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        "Failed to start batch screening: " +
          (err.response?.data?.error || err.message),
      );
    }
  };

  const handleConfirmRescreen = () => {
    if (confirmRescreenModal.candidates.length > 0) {
      dispatch(
        startGlobalScreening({
          candidates: confirmRescreenModal.candidates,
          jobId: selectedJobId,
        }),
      );
      toast.success(
        `Re-screening ${confirmRescreenModal.candidates.length} candidate(s) in the background!`,
      );
    }
    setConfirmRescreenModal({ open: false, candidates: [] });
  };

  // Multi-select state for drag-and-drop
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectedIdsRef = useRef<Set<string>>(new Set());
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const dndManagerRef = useRef<DragDropManager | null>(null);
  const [dndManager, setDndManager] = useState<DragDropManager | null>(null);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  // Fetch detailed Candidate info on-demand when the drawer opens
  const { data: fullCandidate, isLoading: loadingDetails } = useQuery({
    queryKey: ["candidate-details", orgId, selectedCandidateId],
    queryFn: async () => {
      if (!orgId || !selectedCandidateId) return null;
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&id=${selectedCandidateId}`,
      );
      return res.data.data;
    },
    enabled: !!orgId && !!selectedCandidateId,
  });

  // Fetch Job Postings
  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ["recruitment-jobs", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await axios.get(`/api/jobs?orgId=${orgId}&all=true`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  // Auto-select first active job
  useEffect(() => {
    if (jobs && jobs.length > 0 && (!selectedJobId || selectedJobId === "all")) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  // Mutation to update candidate stage
  const updateCandidateStageMutation = useMutation({
    mutationFn: async ({
      candidateId,
      newStage,
    }: {
      candidateId: string;
      newStage: string;
    }) => {
      const res = await axios.put("/api/candidates", {
        id: candidateId,
        stage: newStage,
      });
      return res.data;
    },
  });

  const [movingIds, setMovingIds] = useState<Set<string>>(new Set());

  const moveCandidate = async (candidateId: string, newStage: string) => {
    const idsToMove = selectedIdsRef.current.has(candidateId)
      ? Array.from(selectedIdsRef.current)
      : [candidateId];

    setMovingIds(new Set(idsToMove));
    try {
      await Promise.all(
        idsToMove.map((id) =>
          updateCandidateStageMutation.mutateAsync({
            candidateId: id,
            newStage,
          }),
        ),
      );
      toast.success(
        idsToMove.length > 1
          ? `Moved ${idsToMove.length} candidates to ${newStage}`
          : `Candidate moved to ${newStage}`,
      );
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to move candidate(s)");
    } finally {
      setMovingIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["recruitment-candidates"] });
      queryClient.invalidateQueries({ queryKey: ["candidate-details"] });
      queryClient.invalidateQueries({ queryKey: ["offers-overview-candidates"] });
    }
  };

  const moveCandidateRef = useRef(moveCandidate);
  useEffect(() => {
    moveCandidateRef.current = moveCandidate;
  });

  // Setup HTML5 Drag and Drop Manager
  useEffect(() => {
    const manager = new DragDropManager({
      sensors: [PointerSensor],
    });

    dndManagerRef.current = manager;
    setDndManager(manager);

    const unsubOver = manager.monitor.addEventListener("dragover", (event) => {
      const target = event.operation.target;
      if (target?.type === "column") {
        setDragOverStage(target.id as string);
      } else {
        setDragOverStage(null);
      }
    });

    const unsubEnd = manager.monitor.addEventListener("dragend", (event) => {
      setDragOverStage(null);
      if (event.canceled) return;
      const { source, target } = event.operation;
      if (!source || !target) return;

      const candidateId = source.id as string;
      let newStage: string | null = null;

      if (target.type === "column" || target.data?.stage) {
        newStage = (target.data?.stage || target.id) as string;
      } else if (target.type === "card") {
        newStage = (target.data?.stage || null) as string;
      }

      if (newStage && source.data?.stage !== newStage) {
        moveCandidateRef.current(candidateId, newStage);
      }
    });

    return () => {
      unsubEnd();
      unsubOver();
      manager.destroy();
    };
  }, []);

  const handleToggleSelect = useCallback((cand: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cand._id)) {
        next.delete(cand._id);
      } else {
        next.add(cand._id);
      }
      return next;
    });
  }, []);

  // Per-stage pagination queries
  const stageAppliedQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "applied"],
    queryFn: async ({ pageParam = 1 }) => {
      if (!orgId || !selectedJobId || selectedJobId === "all")
        return { data: [], pagination: { total: 0 } };
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&stage=applied&page=${pageParam}&limit=10`,
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.page < lastPage.pagination?.pages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!orgId && !!selectedJobId && selectedJobId !== "all",
  });

  const stageScreenedQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "screened"],
    queryFn: async ({ pageParam = 1 }) => {
      if (!orgId || !selectedJobId || selectedJobId === "all")
        return { data: [], pagination: { total: 0 } };
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&stage=screened&page=${pageParam}&limit=10`,
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.page < lastPage.pagination?.pages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!orgId && !!selectedJobId && selectedJobId !== "all",
  });

  const stageInterviewingQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "interviewing"],
    queryFn: async ({ pageParam = 1 }) => {
      if (!orgId || !selectedJobId || selectedJobId === "all")
        return { data: [], pagination: { total: 0 } };
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&stage=interviewing&page=${pageParam}&limit=10`,
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.page < lastPage.pagination?.pages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!orgId && !!selectedJobId && selectedJobId !== "all",
  });

  const stageOfferedQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "offered"],
    queryFn: async ({ pageParam = 1 }) => {
      if (!orgId || !selectedJobId || selectedJobId === "all")
        return { data: [], pagination: { total: 0 } };
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&stage=offered&page=${pageParam}&limit=10`,
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.page < lastPage.pagination?.pages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!orgId && !!selectedJobId && selectedJobId !== "all",
  });

  const stageHiredQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "hired"],
    queryFn: async ({ pageParam = 1 }) => {
      if (!orgId || !selectedJobId || selectedJobId === "all")
        return { data: [], pagination: { total: 0 } };
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&stage=hired&page=${pageParam}&limit=10`,
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.page < lastPage.pagination?.pages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!orgId && !!selectedJobId && selectedJobId !== "all",
  });

  const stageRejectedQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "rejected"],
    queryFn: async ({ pageParam = 1 }) => {
      if (!orgId || !selectedJobId || selectedJobId === "all")
        return { data: [], pagination: { total: 0 } };
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&stage=rejected&page=${pageParam}&limit=10`,
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.page < lastPage.pagination?.pages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!orgId && !!selectedJobId && selectedJobId !== "all",
  });

  const stageQueries: Record<string, any> = {
    applied: stageAppliedQuery,
    screened: stageScreenedQuery,
    interviewing: stageInterviewingQuery,
    offered: stageOfferedQuery,
    hired: stageHiredQuery,
    rejected: stageRejectedQuery,
  };

  const loadingCandidates =
    stageAppliedQuery.isLoading ||
    stageScreenedQuery.isLoading ||
    stageInterviewingQuery.isLoading ||
    stageOfferedQuery.isLoading ||
    stageHiredQuery.isLoading ||
    stageRejectedQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Candidates Board
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor candidate flows across evaluation stages, issue formal job offers, and track hires.
          </p>
        </div>

        {selectedJobId && selectedJobId !== "all" && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs font-bold gap-2 flex items-center bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 text-violet-700 hover:text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-800/80 shadow-xs cursor-pointer shrink-0 self-start sm:self-auto rounded-xl"
            onClick={handleBatchScreen}
            disabled={isBatchScreening}
          >
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400 animate-pulse" />
            {isBatchScreening ? "AI Screening in Progress..." : "Run Gemini AI Screening"}
          </Button>
        )}
      </div>

      <CandidateBoard
        jobs={jobs}
        loadingJobs={loadingJobs}
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
        orgId={orgId || ""}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        loadingCandidates={loadingCandidates}
        PIPELINE_STAGES={PIPELINE_STAGES}
        stageQueries={stageQueries}
        dragOverStage={dragOverStage}
        dndManager={dndManager}
        movingIds={movingIds}
        handleToggleSelect={handleToggleSelect}
        setSelectedCandidateId={setSelectedCandidateId}
        handleBatchScreen={handleBatchScreen}
        batchScreening={isBatchScreening}
        batchProgress={batchProgress}
        batchTotal={batchTotal}
        batchCurrentName={batchCurrentName}
        totalCandidates={totalCandidates}
        screenedCandidates={screenedCandidates}
        unscreenedCandidates={unscreenedCandidates}
        loadingJobCandidates={loadingJobCandidates}
      />

      <CandidateDetailsDrawer
        selectedCandidateId={selectedCandidateId}
        setSelectedCandidateId={setSelectedCandidateId}
        loadingDetails={loadingDetails}
        fullCandidate={fullCandidate}
        updateCandidateStageMutation={updateCandidateStageMutation}
        moveCandidate={moveCandidate}
      />

      {/* Re-screening Confirmation Modal */}
      {confirmRescreenModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  All Candidates Already Screened
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  All {confirmRescreenModal.candidates.length} candidates for this job posting have previously been screened.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
              Do you want to re-run the Gemini AI screening pipeline on all{" "}
              {confirmRescreenModal.candidates.length} candidates in the background?
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold"
                onClick={() =>
                  setConfirmRescreenModal({ open: false, candidates: [] })
                }
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold"
                onClick={handleConfirmRescreen}
              >
                Yes, Re-screen All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
