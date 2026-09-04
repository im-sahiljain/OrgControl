"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Sparkles,
  Loader2,
  X,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { RootState } from "@/app/reduxToolkit/store";
import {
  startGlobalScreening,
  updateGlobalScreeningProgress,
  setSyncedScreeningState,
  requestCancelGlobalScreening,
  stopOrFinishGlobalScreening,
} from "@/app/reduxToolkit/slice";
import { Button } from "@/components/ui/button";

const SCREENING_STORAGE_KEY = "org_control_screening_state";
const SCREENING_CANCEL_KEY = "org_control_screening_cancel";
const CHANNEL_NAME = "org_control_screening_channel";

export function GlobalScreeningWorker() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const isBatchScreening = useSelector(
    (state: RootState) => state.employeeUI.isBatchScreening
  );
  const batchQueue = useSelector(
    (state: RootState) => state.employeeUI.batchQueue
  );
  const batchTotal = useSelector(
    (state: RootState) => state.employeeUI.batchTotal
  );
  const batchProgress = useSelector(
    (state: RootState) => state.employeeUI.batchProgress
  );
  const batchCurrentName = useSelector(
    (state: RootState) => state.employeeUI.batchCurrentName
  );
  const batchJobId = useSelector(
    (state: RootState) => state.employeeUI.batchJobId
  );
  const cancelRequested = useSelector(
    (state: RootState) => state.employeeUI.cancelRequested
  );

  const [isMinimized, setIsMinimized] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  // References to keep loop state steady across re-renders
  const isRunningRef = useRef(false);
  const cancelRequestedRef = useRef(cancelRequested);
  const jobTitleCacheRef = useRef<Record<string, string>>({});
  const channelRef = useRef<BroadcastChannel | null>(null);

  const batchTotalRef = useRef(batchTotal);
  const batchProgressRef = useRef(batchProgress);
  const batchCurrentNameRef = useRef(batchCurrentName);
  const batchJobIdRef = useRef(batchJobId);
  const orgIdRef = useRef(orgId);

  useEffect(() => {
    batchTotalRef.current = batchTotal;
    batchProgressRef.current = batchProgress;
    batchCurrentNameRef.current = batchCurrentName;
    batchJobIdRef.current = batchJobId;
    orgIdRef.current = orgId;
  }, [batchTotal, batchProgress, batchCurrentName, batchJobId, orgId]);

  const invalidateAllCandidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["recruitment-candidates"] });
    queryClient.invalidateQueries({ queryKey: ["analytics-candidates"] });
    queryClient.invalidateQueries({ queryKey: ["candidatesPool"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    queryClient.invalidateQueries({ queryKey: ["unscreened-candidates"] });
    queryClient.invalidateQueries({ queryKey: ["posting-analytics"] });
    queryClient.invalidateQueries({ queryKey: ["job-candidates"] });
  };

  // 1. Initialize BroadcastChannel & sync on mount from localStorage
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    let resumeTimeout: NodeJS.Timeout | null = null;
    let leaderResponded = false;

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === "PING_WORKER") {
          // If this tab is actively executing the screening loop, declare leadership
          if (isRunningRef.current) {
            channel?.postMessage({
              type: "PONG_WORKER",
              payload: {
                isBatchScreening: true,
                batchTotal: batchTotalRef.current,
                batchProgress: batchProgressRef.current,
                batchCurrentName: batchCurrentNameRef.current,
                batchJobId: batchJobIdRef.current,
                orgId: orgIdRef.current,
              },
            });
          }
        } else if (type === "PONG_WORKER" && payload) {
          leaderResponded = true;
          if (!isRunningRef.current) {
            dispatch(setSyncedScreeningState(payload));
            invalidateAllCandidateQueries();
          }
        } else if (type === "SCREENING_UPDATE" && payload) {
          leaderResponded = true;
          // If another tab is running, sync its live state into this tab's Redux
          if (!isRunningRef.current) {
            dispatch(setSyncedScreeningState(payload));
            invalidateAllCandidateQueries();
          }
        } else if (type === "SCREENING_FINISHED") {
          cancelRequestedRef.current = false;
          dispatch(stopOrFinishGlobalScreening());
          invalidateAllCandidateQueries();
        } else if (type === "SCREENING_CANCELLED") {
          cancelRequestedRef.current = true;
          dispatch(stopOrFinishGlobalScreening());
          invalidateAllCandidateQueries();
        } else if (type === "REQUEST_CANCEL") {
          cancelRequestedRef.current = true;
          dispatch(requestCancelGlobalScreening());
          dispatch(stopOrFinishGlobalScreening());
          if (typeof window !== "undefined") {
            localStorage.removeItem(SCREENING_STORAGE_KEY);
          }
        }
      };
    }

    // Check localStorage for active session
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SCREENING_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.isBatchScreening && parsed.batchJobId) {
            // Instantly sync UI state so the widget stays visible on page reload
            dispatch(
              setSyncedScreeningState({
                isBatchScreening: true,
                batchTotal: parsed.batchTotal || 0,
                batchProgress: parsed.batchProgress || 0,
                batchCurrentName: parsed.batchCurrentName || "",
                batchJobId: parsed.batchJobId || null,
              })
            );

            // Ping across tabs to check if another tab is currently running the loop
            if (channel) {
              channel.postMessage({ type: "PING_WORKER" });
            }

            // If no active leader responds within 350ms, this tab resumes the queue
            resumeTimeout = setTimeout(async () => {
              if (!leaderResponded && !isRunningRef.current) {
                try {
                  const targetOrg = parsed.orgId || orgId;
                  const queryUrl = targetOrg
                    ? `/api/candidates?orgId=${targetOrg}&jobId=${parsed.batchJobId}&all=true`
                    : `/api/candidates?jobId=${parsed.batchJobId}&all=true`;

                  const res = await axios.get(queryUrl);
                  const allCandidates = res.data.data || [];
                  const unscreened = allCandidates.filter(
                    (c: any) => !c.isAiScreened
                  );

                  if (unscreened.length > 0) {
                    const totalCount =
                      parsed.batchTotal || allCandidates.length;
                    const completedCount = Math.max(
                      0,
                      totalCount - unscreened.length
                    );

                    dispatch(
                      startGlobalScreening({
                        candidates: unscreened,
                        jobId: parsed.batchJobId,
                        total: totalCount,
                        initialProgress: completedCount,
                      })
                    );
                  } else {
                    // All candidates finished
                    localStorage.removeItem(SCREENING_STORAGE_KEY);
                    dispatch(stopOrFinishGlobalScreening());
                  }
                } catch (err) {
                  console.error("Failed to auto-resume screening queue:", err);
                }
              }
            }, 350);
          }
        } catch (e) {
          console.error("Failed to parse saved screening state:", e);
        }
      }

      // Storage event listener fallback for cross-tab communication
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === SCREENING_STORAGE_KEY) {
          if (e.newValue) {
            try {
              const parsed = JSON.parse(e.newValue);
              if (parsed && parsed.isBatchScreening && !isRunningRef.current) {
                dispatch(setSyncedScreeningState(parsed));
              }
            } catch {}
          } else if (!isRunningRef.current) {
            dispatch(stopOrFinishGlobalScreening());
          }
        } else if (e.key === SCREENING_CANCEL_KEY) {
          cancelRequestedRef.current = true;
          dispatch(requestCancelGlobalScreening());
          dispatch(stopOrFinishGlobalScreening());
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        if (channel) channel.close();
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [dispatch, queryClient, orgId]);

  // Continuous Watchdog to auto-recover if browser tab went idle, reloaded, or leader stopped
  useEffect(() => {
    const watchdogTimer = setInterval(async () => {
      if (typeof window === "undefined") return;
      if (isRunningRef.current || cancelRequestedRef.current) return;

      const saved = localStorage.getItem(SCREENING_STORAGE_KEY);
      if (!saved) return;

      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isBatchScreening && parsed.batchJobId) {
          // If no heartbeat from any leader tab in 5 seconds, take over automatically
          if (Date.now() - (parsed.updatedAt || 0) > 5000) {
            const targetOrg = parsed.orgId || orgIdRef.current;
            const queryUrl = targetOrg
              ? `/api/candidates?orgId=${targetOrg}&jobId=${parsed.batchJobId}&all=true`
              : `/api/candidates?jobId=${parsed.batchJobId}&all=true`;

            const res = await axios.get(queryUrl);
            const allCandidates = res.data.data || [];
            const unscreened = allCandidates.filter(
              (c: any) => !c.isAiScreened
            );

            if (unscreened.length > 0) {
              const totalCount = parsed.batchTotal || allCandidates.length;
              const completedCount = Math.max(
                0,
                totalCount - unscreened.length
              );

              dispatch(
                startGlobalScreening({
                  candidates: unscreened,
                  jobId: parsed.batchJobId,
                  total: totalCount,
                  initialProgress: completedCount,
                })
              );
            } else {
              localStorage.removeItem(SCREENING_STORAGE_KEY);
              dispatch(stopOrFinishGlobalScreening());
            }
          }
        }
      } catch (e) {
        console.error("Screening Watchdog error:", e);
      }
    }, 3000);

    return () => clearInterval(watchdogTimer);
  }, [dispatch]);

  useEffect(() => {
    cancelRequestedRef.current = cancelRequested;
  }, [cancelRequested]);

  // Broadcast helper
  const broadcastState = (stateObj: {
    isBatchScreening: boolean;
    batchTotal: number;
    batchProgress: number;
    batchCurrentName: string;
    batchJobId: string | null;
    orgId?: string;
  }) => {
    if (typeof window !== "undefined") {
      const payload = {
        ...stateObj,
        orgId: stateObj.orgId || orgIdRef.current,
        updatedAt: Date.now(),
      };
      localStorage.setItem(SCREENING_STORAGE_KEY, JSON.stringify(payload));
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "SCREENING_UPDATE",
          payload: stateObj,
        });
      }
    }
  };

  // Perform actual Cancellation
  const executeCancel = () => {
    setShowCancelConfirm(false);
    cancelRequestedRef.current = true;
    dispatch(requestCancelGlobalScreening());
    dispatch(stopOrFinishGlobalScreening());

    if (typeof window !== "undefined") {
      localStorage.removeItem(SCREENING_STORAGE_KEY);
      localStorage.setItem(SCREENING_CANCEL_KEY, Date.now().toString());
      if (channelRef.current) {
        channelRef.current.postMessage({ type: "SCREENING_CANCELLED" });
        channelRef.current.postMessage({ type: "REQUEST_CANCEL" });
      }
    }
  };

  // Main Worker Loop (runs continuously across pages until finished or cancelled)
  useEffect(() => {
    if (isBatchScreening && batchQueue.length > 0 && !isRunningRef.current) {
      isRunningRef.current = true;
      cancelRequestedRef.current = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem(SCREENING_CANCEL_KEY);
      }

      const runScreeningQueue = async () => {
        let count = batchProgress || 0;
        const total = batchTotal || batchQueue.length;

        // Broadcast initial state
        broadcastState({
          isBatchScreening: true,
          batchTotal: total,
          batchProgress: count,
          batchCurrentName: batchQueue[0]?.name || "",
          batchJobId,
          orgId,
        });

        let completedSuccessfully = false;

        try {
          for (let i = 0; i < batchQueue.length; i++) {
            if (cancelRequestedRef.current) {
              toast.error("AI batch screening cancelled.");
              break;
            }

            const cand = batchQueue[i];
            dispatch(
              updateGlobalScreeningProgress({
                progress: count,
                currentName: cand.name,
              })
            );

            broadcastState({
              isBatchScreening: true,
              batchTotal: total,
              batchProgress: count,
              batchCurrentName: cand.name,
              batchJobId,
              orgId,
            });

            try {
              // 1. Resolve Job Title (use memory cache if already fetched)
              let jobTitle = "Software Engineer";
              if (cand.jobId) {
                if (jobTitleCacheRef.current[cand.jobId]) {
                  jobTitle = jobTitleCacheRef.current[cand.jobId];
                } else {
                  try {
                    const jobRes = await axios.get(`/api/jobs/${cand.jobId}`);
                    jobTitle = jobRes.data.data?.title || "Software Engineer";
                    jobTitleCacheRef.current[cand.jobId] = jobTitle;
                  } catch {
                    jobTitle = "Software Engineer";
                  }
                }
              }

              // 2. Parse candidate resume using Google Gemini AI with retries
              let parseRes: any = null;
              let retryCount = 0;
              while (retryCount < 3 && !parseRes && !cancelRequestedRef.current) {
                try {
                  parseRes = await axios.post("/api/candidates/parse", {
                    name: cand.name,
                    email: cand.email,
                    phone: cand.phone,
                    jobTitle,
                    resumeUrl: cand.resumeUrl,
                    resumeText: cand.resumeText || "",
                  });
                } catch (parseErr: any) {
                  retryCount++;
                  if (retryCount >= 3) {
                    console.error(`Candidate ${cand.name} failed parsing after 3 attempts:`, parseErr);
                    break;
                  }
                  await new Promise((r) => setTimeout(r, 1500 * retryCount));
                }
              }

              if (cancelRequestedRef.current) {
                toast.error("AI batch screening cancelled. Remaining candidates skipped.");
                break;
              }

              if (parseRes?.data?.data) {
                const aiInsights = parseRes.data.data;

                // 3. Atomically update MongoDB record with insights, stage, and embeddings
                await axios.put("/api/candidates", {
                  id: cand._id,
                  stage: cand.stage === "applied" || !cand.stage ? "screened" : cand.stage,
                  isAiScreened: true,
                  matchScore: aiInsights.matchScore,
                  skills: aiInsights.skills,
                  summary: aiInsights.summary,
                  pros: aiInsights.pros,
                  cons: aiInsights.cons,
                  interviewQuestions: aiInsights.interviewQuestions,
                  resumeText: aiInsights.extractedResumeText || "",
                });

                // Immediately update all boards, charts, analytics, and tables simultaneously
                invalidateAllCandidateQueries();
              }
            } catch (candErr: any) {
              console.error(`Error screening candidate ${cand.name}:`, candErr);
              // Never abort the loop if an individual resume has an error
            }

            count++;
            const nextCandidate = batchQueue[i + 1];
            const nextName = nextCandidate ? nextCandidate.name : cand.name;

            dispatch(
              updateGlobalScreeningProgress({
                progress: count,
                currentName: nextName,
              })
            );

            broadcastState({
              isBatchScreening: true,
              batchTotal: total,
              batchProgress: count,
              batchCurrentName: nextName,
              batchJobId,
              orgId,
            });

            if (cancelRequestedRef.current) {
              break;
            }

            // Cooldown between candidates for API smoothness
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (cancelRequestedRef.current) {
              break;
            }
          }

          if (!cancelRequestedRef.current) {
            completedSuccessfully = true;
            toast.success(
              `Batch AI screening completed! Processed ${count} of ${total} candidate(s).`,
              { duration: 5000 }
            );
          }
        } catch (err: any) {
          console.error("Global screening loop unexpected error:", err);
        } finally {
          isRunningRef.current = false;
          // ONLY clear state and finish if cancelled OR all candidates are completed
          if (cancelRequestedRef.current || completedSuccessfully) {
            if (typeof window !== "undefined") {
              localStorage.removeItem(SCREENING_STORAGE_KEY);
              if (channelRef.current) {
                channelRef.current.postMessage({
                  type: cancelRequestedRef.current
                    ? "SCREENING_CANCELLED"
                    : "SCREENING_FINISHED",
                });
              }
            }
            invalidateAllCandidateQueries();
            dispatch(stopOrFinishGlobalScreening());
          }
        }
      };

      runScreeningQueue();
    }
  }, [isBatchScreening, batchQueue, batchJobId, dispatch, queryClient, orgId]);

  if (!isBatchScreening) {
    return null;
  }

  const percentage = Math.min(
    100,
    Math.round((batchProgress / (batchTotal || 1)) * 100)
  );
  const isOnBoardPage = pathname === "/recruitment/candidates-board";

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 max-w-sm sm:max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-violet-200 dark:border-violet-900/60 shadow-2xl rounded-2xl p-4 text-zinc-900 dark:text-zinc-100 ring-1 ring-black/5 dark:ring-white/10">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 animate-pulse text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5 text-zinc-900 dark:text-zinc-50">
                  AI Batch Screening
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300">
                    {percentage}%
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Running in background across pages & tabs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Cancel Screening"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {!isMinimized && (
            <div className="mt-3.5 space-y-3">
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  <span>
                    Processed {batchProgress} of {batchTotal} candidates
                  </span>
                  <span>{percentage}%</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Current Candidate */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-150 dark:border-zinc-850 text-[11px]">
                <Loader2 className="h-3.5 w-3.5 text-violet-600 animate-spin shrink-0" />
                <div className="truncate flex-1">
                  <span className="text-zinc-400 font-medium">Analyzing: </span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {batchCurrentName || "Candidate..."}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {!isOnBoardPage ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] font-bold gap-1 px-2.5 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/30 text-violet-650 hover:text-violet-750 dark:text-violet-300 border-violet-200/60 dark:border-violet-800/60 cursor-pointer"
                    onClick={() => router.push("/recruitment/candidates-board")}
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Board
                  </Button>
                ) : (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Live on Board
                  </span>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-[10px] font-bold px-2.5 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer ml-auto"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel Batch
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Prompt Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Stop AI Batch Screening?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Currently screened {batchProgress} of {batchTotal} candidates.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850 leading-relaxed">
              Are you sure you want to stop the AI screening process? Candidates already screened will be preserved, and the remaining candidates will stay in the queue.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold cursor-pointer"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Screening
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                onClick={executeCancel}
              >
                Yes, Stop Screening
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
