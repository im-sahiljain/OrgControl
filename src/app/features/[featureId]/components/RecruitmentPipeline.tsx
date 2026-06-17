"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  Plus,
  ArrowRight,
  Loader2,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/app/reduxToolkit/store";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DragDropManager,
  PointerSensor,
  PointerActivationConstraints,
  Feedback,
} from "@dnd-kit/dom";

import { KanbanColumn } from "./recruitment/KanbanColumn";
import { JobsTable } from "./recruitment/JobsTable";
import { JobPostingForm } from "./recruitment/JobPostingForm";
import { RagSearch } from "./recruitment/RagSearch";
import { CandidateDetailsDrawer } from "./recruitment/CandidateDetailsDrawer";
import { EditJobModal } from "./recruitment/EditJobModal";
import { ToggleStatusDialog } from "./recruitment/ToggleStatusDialog";

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
    id: "rejected",
    name: "Rejected",
    color:
      "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900/50",
  },
];

export default function RecruitmentPipeline({ feature }: { feature: any }) {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  const [activeTab, setActiveTab] = useState<
    "candidates" | "jobs" | "post-job" | "rag-search"
  >("candidates");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );

  // Semantic RAG Search & Batch Screening states
  const [ragSearchQuery, setRagSearchQuery] = useState("");
  const [ragResults, setRagResults] = useState<any[] | null>(null);
  const [searchingRag, setSearchingRag] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [batchScreening, setBatchScreening] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchCurrentName, setBatchCurrentName] = useState("");
  const [searchMethod, setSearchMethod] = useState<string | null>(null);

  // Cache of RAG search results per Job ID to preserve data on dropdown changes
  const [ragResultsCache, setRagResultsCache] = useState<Record<string, any[]>>(
    {},
  );
  const [ragQueriesCache, setRagQueriesCache] = useState<
    Record<string, string>
  >({});
  const [ragMethodsCache, setRagMethodsCache] = useState<
    Record<string, string>
  >({});

  // Synchronize displayed RAG search data when the selected Job changes
  useEffect(() => {
    if (selectedJobId) {
      setRagResults(ragResultsCache[selectedJobId] || null);
      setRagSearchQuery(ragQueriesCache[selectedJobId] || "");
      setSearchMethod(ragMethodsCache[selectedJobId] || null);
      setSearchError(null);
    } else {
      setRagResults(null);
      setRagSearchQuery("");
      setSearchMethod(null);
      setSearchError(null);
    }
  }, [selectedJobId, ragResultsCache, ragQueriesCache, ragMethodsCache]);

  // Multi-select state for drag-and-drop
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectedIdsRef = useRef<Set<string>>(new Set());
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const dndManagerRef = useRef<DragDropManager | null>(null);
  const [dndManager, setDndManager] = useState<DragDropManager | null>(null);

  // Keep selectedIdsRef in sync with state (for use in closures)
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  // Job creation form states
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("Engineering");
  const [jobLoc, setJobLoc] = useState("Remote");
  const [jobType, setJobType] = useState("Full-time");
  const [jobDesc, setJobDesc] = useState("");
  const [jobReqs, setJobReqs] = useState("");

  // Jobs list filter/search state
  const [jobSearchInput, setJobSearchInput] = useState("");
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");

  // Edit Job state
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editJobDept, setEditJobDept] = useState("Engineering");
  const [editJobLoc, setEditJobLoc] = useState("Remote");
  const [editJobType, setEditJobType] = useState("Full-time");
  const [editJobDesc, setEditJobDesc] = useState("");
  const [editJobReqs, setEditJobReqs] = useState("");

  // Toggle Job state
  const [togglingJob, setTogglingJob] = useState<any | null>(null);

  useEffect(() => {
    if (editingJob) {
      setEditJobTitle(editingJob.title || "");
      setEditJobDept(editingJob.department || "Engineering");
      setEditJobLoc(editingJob.location || "Remote");
      setEditJobType(editingJob.type || "Full-time");
      setEditJobDesc(editingJob.description || "");
      const editingRequirements = Array.isArray(editingJob.requirements)
        ? editingJob.requirements
        : typeof editingJob.requirements === "string"
          ? [editingJob.requirements]
          : [];
      setEditJobReqs(editingRequirements.join("\n"));
    }
  }, [editingJob]);

  const handleEditClick = (job: any) => {
    if (user?.isSandbox) {
      toast.error("Operation not performable in Mock");
      return;
    }
    setEditingJob(job);
  };

  const handleToggleStatusClick = (job: any) => {
    if (user?.isSandbox) {
      toast.error("Operation not performable in Mock");
      return;
    }
    setTogglingJob(job);
  };

  const runRagSearch = async (query: string = "") => {
    if (!selectedJobId) return;
    setSearchingRag(true);
    setSearchError(null);
    try {
      const res = await axios.post("/api/candidates/match", {
        jobId: selectedJobId,
        searchQuery: query,
        limit: 20,
      });
      if (res.data.success) {
        const results = res.data.data;
        const method = res.data.searchMethod;
        setRagResults(results);
        setSearchMethod(method);

        // Save to cache
        setRagResultsCache((prev) => ({ ...prev, [selectedJobId]: results }));
        setRagQueriesCache((prev) => ({ ...prev, [selectedJobId]: query }));
        setRagMethodsCache((prev) => ({ ...prev, [selectedJobId]: method }));
      } else {
        setSearchError(res.data.error || "Failed to search candidates.");
      }
    } catch (err: any) {
      console.error(err);
      setSearchError(
        err.response?.data?.error || "Error connecting to search service.",
      );
    } finally {
      setSearchingRag(false);
    }
  };

  const handleBatchScreen = async () => {
    if (!selectedJobId) return;

    setBatchScreening(true);
    setBatchProgress(0);
    setBatchCurrentName("");

    try {
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}`,
      );
      const allCandidates = res.data.data || [];
      const unscreened = allCandidates.filter((c: any) => !c.isAiScreened);

      const executeScreening = async (candidatesToScreen: any[]) => {
        setBatchTotal(candidatesToScreen.length);
        let count = 0;

        try {
          for (const cand of candidatesToScreen) {
            setBatchCurrentName(cand.name);
            try {
              const jobRes = await axios.get(`/api/jobs/${cand.jobId}`);
              const jobTitle = jobRes.data.data?.title || "Software Engineer";

              const parseRes = await axios.post("/api/candidates/parse", {
                name: cand.name,
                email: cand.email,
                phone: cand.phone,
                jobTitle,
                resumeUrl: cand.resumeUrl,
              });

              const aiInsights = parseRes.data.data;

              await axios.put("/api/candidates", {
                id: cand._id,
                isAiScreened: true,
                matchScore: aiInsights.matchScore,
                skills: aiInsights.skills,
                summary: aiInsights.summary,
                pros: aiInsights.pros,
                cons: aiInsights.cons,
                interviewQuestions: aiInsights.interviewQuestions,
                resumeText: aiInsights.extractedResumeText || "",
              });
            } catch (err) {
              console.error(`Failed to screen candidate ${cand.name}`, err);
            }

            count++;
            setBatchProgress(count);
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }

          toast.success(
            `Batch AI screening completed successfully! Processed ${count} candidate(s).`,
          );
          queryClient.invalidateQueries({
            queryKey: ["recruitment-candidates"],
          });
          runRagSearch(ragSearchQuery);
        } catch (err: any) {
          console.error(err);
          toast.error(
            "Failed to run batch screening: " +
              (err.response?.data?.error || err.message),
          );
        } finally {
          setBatchScreening(false);
        }
      };

      if (unscreened.length === 0) {
        if (allCandidates.length === 0) {
          toast("No candidates found for this job posting.");
          setBatchScreening(false);
          return;
        }

        toast(
          (t) => (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                All candidates for this job posting are already AI-screened.
                Would you like to screen all of them again?
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.dismiss(t.id);
                    setBatchScreening(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.dismiss(t.id);
                    executeScreening(allCandidates);
                  }}
                >
                  OK
                </Button>
              </div>
            </div>
          ),
          { duration: Infinity, position: "top-center" },
        );
      } else {
        executeScreening(unscreened);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        "Failed to fetch candidates: " +
          (err.response?.data?.error || err.message),
      );
      setBatchScreening(false);
    }
  };

  const handleUpdateStageFromRag = async (
    candidateId: string,
    newStage: string,
  ) => {
    try {
      await updateCandidateStageMutation.mutateAsync({ candidateId, newStage });
      setRagResults((prev) =>
        prev
          ? prev.map((c) =>
              c._id === candidateId ? { ...c, stage: newStage } : c,
            )
          : null,
      );
      setRagResultsCache((prev) => {
        const cached = prev[selectedJobId];
        if (!cached) return prev;
        return {
          ...prev,
          [selectedJobId]: cached.map((c) =>
            c._id === candidateId ? { ...c, stage: newStage } : c,
          ),
        };
      });
    } catch (err) {
      console.error("Failed to update candidate stage from RAG list:", err);
    }
  };

  // -----------------------------------------------------------------

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

  // 1. Fetch Job Postings
  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: [
      "recruitment-jobs",
      orgId,
      jobSearch,
      jobStatusFilter,
      jobTypeFilter,
    ],
    queryFn: async () => {
      if (!orgId) return [];
      const params = new URLSearchParams({
        orgId,
        all: "true",
        search: jobSearch,
      });

      if (jobStatusFilter && jobStatusFilter !== "all") {
        params.set("status", jobStatusFilter);
      }

      if (jobTypeFilter && jobTypeFilter !== "all") {
        params.set("type", jobTypeFilter);
      }

      const res = await axios.get(`/api/jobs?${params.toString()}`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  // Fetch all candidates for the selected job to calculate stats (Total, Screened, Unscreened)
  const { data: jobCandidates = [], isLoading: loadingJobCandidates } = useQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "all-job"],
    queryFn: async () => {
      if (!orgId || !selectedJobId) return [];
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&limit=1000`
      );
      return res.data.data || [];
    },
    enabled: !!orgId && !!selectedJobId,
  });

  const totalCandidates = jobCandidates.length;
  const screenedCandidates = jobCandidates.filter((c: any) => c.isAiScreened).length;
  const unscreenedCandidates = jobCandidates.filter((c: any) => !c.isAiScreened).length;


  useEffect(() => {
    const handler = setTimeout(() => {
      setJobSearch(jobSearchInput.trim());
    }, 300);

    return () => clearTimeout(handler);
  }, [jobSearchInput]);

  // Automatically select first job
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  // 2. Fetch Candidates for the selected job (Paginated per column)
  const fetchStageCandidates = async (stage: string, pageParam: number) => {
    if (!orgId || !selectedJobId)
      return {
        data: [],
        pagination: { total: 0, page: 1, limit: 50, pages: 0 },
      };
    const res = await axios.get(
      `/api/candidates?orgId=${orgId}&jobId=${selectedJobId}&stage=${stage}&page=${pageParam}&limit=50`,
    );
    return res.data;
  };

  const appliedQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "applied"],
    queryFn: ({ pageParam = 1 }) => fetchStageCandidates("applied", pageParam),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination || {};
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!orgId && !!selectedJobId,
  });

  const screenedQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "screened"],
    queryFn: ({ pageParam = 1 }) => fetchStageCandidates("screened", pageParam),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination || {};
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!orgId && !!selectedJobId,
  });

  const interviewingQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "interviewing"],
    queryFn: ({ pageParam = 1 }) =>
      fetchStageCandidates("interviewing", pageParam),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination || {};
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!orgId && !!selectedJobId,
  });

  const offeredQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "offered"],
    queryFn: ({ pageParam = 1 }) => fetchStageCandidates("offered", pageParam),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination || {};
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!orgId && !!selectedJobId,
  });

  const rejectedQuery = useInfiniteQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId, "rejected"],
    queryFn: ({ pageParam = 1 }) => fetchStageCandidates("rejected", pageParam),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination || {};
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!orgId && !!selectedJobId,
  });

  const stageQueries: Record<string, any> = {
    applied: appliedQuery,
    screened: screenedQuery,
    interviewing: interviewingQuery,
    offered: offeredQuery,
    rejected: rejectedQuery,
  };

  const loadingCandidates =
    appliedQuery.isLoading ||
    screenedQuery.isLoading ||
    interviewingQuery.isLoading ||
    offeredQuery.isLoading ||
    rejectedQuery.isLoading;

  // 3. Create Job Posting Mutation
  const createJobMutation = useMutation({
    mutationFn: async (newJob: any) => {
      const res = await axios.post("/api/jobs", newJob);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-jobs"] });
      // Reset form
      setJobTitle("");
      setJobDesc("");
      setJobReqs("");
      setActiveTab("jobs");
      toast.success("Job posting successfully created!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to create job posting.");
    },
  });

  // Update Job Posting Mutation
  const updateJobMutation = useMutation({
    mutationFn: async ({
      jobId,
      updatedFields,
    }: {
      jobId: string;
      updatedFields: any;
    }) => {
      const res = await axios.put(`/api/jobs/${jobId}`, updatedFields);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-jobs"] });
      toast.success("Job posting updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update job posting.");
    },
  });

  // 4. Update Candidate Stage Mutation (optimistic updates to avoid flicker)
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
    onMutate: async ({ candidateId, newStage }) => {
      // Cancel in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: ["recruitment-candidates", orgId, selectedJobId],
      });

      // Snapshot all stage caches for rollback
      const snapshots: Record<string, unknown> = {};
      PIPELINE_STAGES.forEach((s) => {
        snapshots[s.id] = queryClient.getQueryData([
          "recruitment-candidates",
          orgId,
          selectedJobId,
          s.id,
        ]);
      });

      // Find the candidate and their current stage from the cache
      let candidateData: any = null;
      let sourceStage: string | null = null;
      for (const s of PIPELINE_STAGES) {
        const cached: any = queryClient.getQueryData([
          "recruitment-candidates",
          orgId,
          selectedJobId,
          s.id,
        ]);
        if (cached?.pages) {
          for (const page of cached.pages) {
            const found = page.data?.find((c: any) => c._id === candidateId);
            if (found) {
              candidateData = { ...found, stage: newStage };
              sourceStage = s.id;
              break;
            }
          }
        }
        if (candidateData) break;
      }

      // Optimistically remove from source stage
      if (sourceStage && sourceStage !== newStage) {
        queryClient.setQueryData(
          ["recruitment-candidates", orgId, selectedJobId, sourceStage],
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                data:
                  page.data?.filter((c: any) => c._id !== candidateId) ?? [],
                pagination: {
                  ...page.pagination,
                  total: Math.max(0, (page.pagination?.total ?? 1) - 1),
                },
              })),
            };
          },
        );
      }

      // Optimistically add to target stage (prepend to first page)
      if (candidateData && sourceStage !== newStage) {
        queryClient.setQueryData(
          ["recruitment-candidates", orgId, selectedJobId, newStage],
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: any, idx: number) =>
                idx === 0
                  ? {
                      ...page,
                      data: [candidateData, ...(page.data ?? [])],
                      pagination: {
                        ...page.pagination,
                        total: (page.pagination?.total ?? 0) + 1,
                      },
                    }
                  : page,
              ),
            };
          },
        );
      }

      return { snapshots };
    },
    onError: (err: any, _vars, context: any) => {
      // Roll back all stage caches to their pre-mutation snapshots
      if (context?.snapshots) {
        PIPELINE_STAGES.forEach((s) => {
          queryClient.setQueryData(
            ["recruitment-candidates", orgId, selectedJobId, s.id],
            context.snapshots[s.id],
          );
        });
      }
      alert(
        err.response?.data?.error ||
          "Failed to update candidate pipeline stage.",
      );
    },
    onSettled: (data, _err, variables) => {
      if (variables?.candidateId) {
        setMovingIds((prev) => {
          const next = new Set(prev);
          next.delete(variables.candidateId);
          return next;
        });
      }
      // Reconcile with server truth after mutation settles (success or error)
      queryClient.invalidateQueries({ queryKey: ["recruitment-candidates"] });
      if (selectedCandidateId === variables?.candidateId) {
        queryClient.invalidateQueries({
          queryKey: ["candidate-details", orgId, selectedCandidateId],
        });
      }
    },
  });

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.isSandbox) {
      toast.error("Operation not performable in Mock");
      return;
    }
    if (!jobTitle || !jobDesc || !jobLoc) {
      toast.error("Please fill all mandatory fields.");
      return;
    }
    const requirements = jobReqs
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    createJobMutation.mutate({
      orgId,
      title: jobTitle,
      department: jobDept,
      location: jobLoc,
      type: jobType,
      description: jobDesc,
      requirements,
    });
  };

  // movingIds tracks cards with in-flight API calls so we can show a loading overlay
  const [movingIds, setMovingIds] = useState<Set<string>>(new Set());

  const moveCandidate = useCallback(
    async (candidateId: string, newStage: string) => {
      setMovingIds((prev) => new Set([...prev, candidateId]));
      try {
        await updateCandidateStageMutation.mutateAsync({
          candidateId,
          newStage,
        });
      } catch {
        // Mutation errors are handled by React Query's onError handler.
      }
    },
    [updateCandidateStageMutation],
  );

  // Ref always points to the latest moveCandidate to avoid stale closures inside DnD event listeners
  const handleMoveCandidateRef = useRef<
    (candidateId: string, targetStage: string) => void
  >(() => {});
  useEffect(() => {
    handleMoveCandidateRef.current = moveCandidate;
  });

  // Toggle a card in the multi-select set
  const handleToggleSelect = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Setup @dnd-kit/dom DragDropManager once on mount
  useEffect(() => {
    const manager = new DragDropManager();
    manager.registry.register(PointerSensor, {
      activationConstraints: [
        new PointerActivationConstraints.Distance({ value: 8 }),
      ],
    });
    manager.registry.register(Feedback, { feedback: "clone" });

    const unsubEnd = manager.monitor.addEventListener(
      "dragend",
      (event: any) => {
        const { operation, canceled } = event;
        setDragOverStage(null);
        if (canceled || !operation.target) return;

        const sourceId = String(operation.source?.id);
        const targetStageId = String(operation.target?.id);

        // Move all selected cards if source is in selection, else move just the dragged card
        const selected = selectedIdsRef.current;
        if (selected.size > 0 && selected.has(sourceId)) {
          selected.forEach((id: string) => {
            handleMoveCandidateRef.current(id, targetStageId);
          });
          setSelectedIds(new Set());
        } else {
          handleMoveCandidateRef.current(sourceId, targetStageId);
        }
      },
    );

    const unsubOver = manager.monitor.addEventListener(
      "dragover",
      (event: any) => {
        setDragOverStage(
          event.operation.target ? String(event.operation.target.id) : null,
        );
      },
    );

    dndManagerRef.current = manager;
    setDndManager(manager);

    return () => {
      unsubEnd();
      unsubOver();
      manager.destroy();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-55 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            AI Recruitment & Screener Workspace
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Publish open postings, monitor candidate flows, and evaluate
            automated AI matching details.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800 text-xs font-semibold select-none shrink-0 w-full overflow-x-auto whitespace-nowrap scrollbar-none gap-1 md:w-fit">
          {[
            { id: "candidates", label: "Candidates Board", icon: Users },
            { id: "jobs", label: "Active Postings", icon: Briefcase },
            { id: "post-job", label: "Create Posting", icon: Plus },
            {
              id: "rag-search",
              label: "Semantic RAG Search",
              icon: Sparkles,
              iconClass: "text-violet-650",
            },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`relative px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-white dark:bg-zinc-850 shadow-sm rounded-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 ${t.iconClass || ""}`} />
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Candidates Board View */}
      {activeTab === "candidates" && (
        <div className="space-y-6">
          {/* Job selection dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
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
                Use the "Create Posting" tab above to draft your first open
                role, then distribute it to candidates.
              </p>
            </div>
          ) : (
            <div className="flex md:grid md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory select-none w-full scrollbar-thin">
              {PIPELINE_STAGES.map((stage) => {
                const query = stageQueries[stage.id];
                const stageCandidates =
                  query.data?.pages.flatMap((page: any) => page.data || []) ||
                  [];
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
      )}{" "}
      {/* Active Postings Tab */}
      {activeTab === "jobs" && (
        <JobsTable
          jobs={jobs}
          loadingJobs={loadingJobs}
          orgId={orgId || ""}
          searchValue={jobSearchInput}
          onSearchChange={setJobSearchInput}
          statusFilter={jobStatusFilter}
          onStatusChange={setJobStatusFilter}
          typeFilter={jobTypeFilter}
          onTypeChange={setJobTypeFilter}
          onResetFilters={() => {
            setJobSearchInput("");
            setJobSearch("");
            setJobStatusFilter("all");
            setJobTypeFilter("all");
          }}
          setSelectedJobId={setSelectedJobId}
          setActiveTab={setActiveTab}
          handleEditClick={handleEditClick}
          handleToggleStatusClick={handleToggleStatusClick}
        />
      )}
      {/* Create Job Posting Tab */}
      {activeTab === "post-job" && (
        <JobPostingForm
          jobTitle={jobTitle}
          setJobTitle={setJobTitle}
          jobDept={jobDept}
          setJobDept={setJobDept}
          jobLoc={jobLoc}
          setJobLoc={setJobLoc}
          jobType={jobType}
          setJobType={setJobType}
          jobDesc={jobDesc}
          setJobDesc={setJobDesc}
          jobReqs={jobReqs}
          setJobReqs={setJobReqs}
          handlePostJob={handlePostJob}
          isPending={createJobMutation.isPending}
        />
      )}
      {/* RAG Vector Search View */}
      {activeTab === "rag-search" && (
        <RagSearch
          jobs={jobs}
          loadingJobs={loadingJobs}
          selectedJobId={selectedJobId}
          setSelectedJobId={setSelectedJobId}
          batchScreening={batchScreening}
          batchProgress={batchProgress}
          batchTotal={batchTotal}
          batchCurrentName={batchCurrentName}
          handleBatchScreen={handleBatchScreen}
          ragSearchQuery={ragSearchQuery}
          setRagSearchQuery={setRagSearchQuery}
          runRagSearch={runRagSearch}
          searchingRag={searchingRag}
          searchError={searchError}
          searchMethod={searchMethod}
          ragResults={ragResults}
          setSelectedCandidateId={setSelectedCandidateId}
          handleUpdateStageFromRag={handleUpdateStageFromRag}
          totalCandidates={totalCandidates}
          screenedCandidates={screenedCandidates}
          unscreenedCandidates={unscreenedCandidates}
          loadingJobCandidates={loadingJobCandidates}
        />
      )}
      {/* Candidate Detail AI Insights Panel */}
      <CandidateDetailsDrawer
        selectedCandidateId={selectedCandidateId}
        setSelectedCandidateId={setSelectedCandidateId}
        loadingDetails={loadingDetails}
        fullCandidate={fullCandidate}
        updateCandidateStageMutation={updateCandidateStageMutation}
        moveCandidate={moveCandidate}
      />
      {/* Edit Job Modal */}
      <EditJobModal
        editingJob={editingJob}
        setEditingJob={setEditingJob}
        editJobTitle={editJobTitle}
        setEditJobTitle={setEditJobTitle}
        editJobDept={editJobDept}
        setEditJobDept={setEditJobDept}
        editJobLoc={editJobLoc}
        setEditJobLoc={setEditJobLoc}
        editJobType={editJobType}
        setEditJobType={setEditJobType}
        editJobDesc={editJobDesc}
        setEditJobDesc={setEditJobDesc}
        editJobReqs={editJobReqs}
        setEditJobReqs={setEditJobReqs}
        updateJobMutation={updateJobMutation}
      />
      {/* Toggle Status Confirmation Dialog */}
      <ToggleStatusDialog
        togglingJob={togglingJob}
        setTogglingJob={setTogglingJob}
        updateJobMutation={updateJobMutation}
      />
    </div>
  );
}
