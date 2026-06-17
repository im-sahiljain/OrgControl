import React from "react";
import { motion } from "framer-motion";
import {
  X,
  FileText,
  Sparkles,
  Check,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidateDetailsDrawerProps {
  selectedCandidateId: string | null;
  setSelectedCandidateId: (id: string | null) => void;
  loadingDetails: boolean;
  fullCandidate: any;
  updateCandidateStageMutation: any;
  moveCandidate: (candidateId: string, newStage: string) => void;
}

export const CandidateDetailsDrawer: React.FC<CandidateDetailsDrawerProps> = ({
  selectedCandidateId,
  setSelectedCandidateId,
  loadingDetails,
  fullCandidate,
  updateCandidateStageMutation,
  moveCandidate,
}) => {
  if (!selectedCandidateId) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-lg flex flex-col h-full overflow-hidden shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="space-y-1 overflow-hidden">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Candidate Profile
            </span>
            {loadingDetails ? (
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-32 animate-pulse mt-1" />
            ) : (
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-55 truncate">
                {fullCandidate?.name}
              </h3>
            )}
            {loadingDetails ? (
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-48 animate-pulse mt-1.5" />
            ) : (
              <span className="text-xxs text-zinc-400 block font-semibold truncate">
                {fullCandidate?.email} | {fullCandidate?.phone}
              </span>
            )}
          </div>
          <button
            onClick={() => setSelectedCandidateId(null)}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-850 rounded-full text-zinc-500 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {loadingDetails ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            <span className="text-xs font-bold text-zinc-500">
              Retrieving AI insights and screening profile...
            </span>
          </div>
        ) : fullCandidate ? (
          <>
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* Score & Resume download */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-150 dark:border-zinc-850/80 rounded-xl gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-500/20 flex items-center justify-center font-bold text-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900">
                    {fullCandidate.matchScore}%
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-100">
                      AI Match Score
                    </h4>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      Scored against job description
                    </span>
                  </div>
                </div>

                {fullCandidate.resumeUrl && (
                  <a
                    href={fullCandidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={`${fullCandidate.name.replace(/\s+/g, "_")}_Resume.pdf`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xxs font-bold gap-1 flex items-center"
                    >
                      <FileText className="h-3.5 w-3.5" /> Download Resume PDF
                    </Button>
                  </a>
                )}
              </div>

              {/* AI Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-600 animate-pulse" />
                  AI Profile Screening Summary
                </h4>
                <p className="text-zinc-650 dark:text-zinc-400 leading-relaxed bg-violet-50/20 dark:bg-violet-950/10 p-3 rounded-lg border border-violet-100/20">
                  {fullCandidate.summary ||
                    "No AI summary parsed for candidate."}
                </p>
              </div>

              {/* Skills parsed */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-100">
                  Extracted Skills Inventory
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {fullCandidate.skills &&
                  fullCandidate.skills.length > 0 ? (
                    fullCandidate.skills.map((sk: string) => (
                      <span
                        key={sk}
                        className="px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded font-semibold text-zinc-650"
                      >
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-400 italic">
                      No skills catalogued.
                    </span>
                  )}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-600 flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Match Strengths
                  </h4>
                  <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-400 leading-relaxed pl-1">
                    {fullCandidate.pros?.map((pro: string, idx: number) => (
                      <li key={idx} className="flex gap-1.5 items-start">
                        <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />
                        {pro}
                      </li>
                    ))}
                    {(!fullCandidate.pros ||
                      fullCandidate.pros.length === 0) && (
                      <li className="italic text-zinc-400">None parsed</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-amber-600 flex items-center gap-1.5">
                    <X className="h-4 w-4" /> Match Gaps
                  </h4>
                  <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-400 leading-relaxed pl-1">
                    {fullCandidate.cons?.map((con: string, idx: number) => (
                      <li key={idx} className="flex gap-1.5 items-start">
                        <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                        {con}
                      </li>
                    ))}
                    {(!fullCandidate.cons ||
                      fullCandidate.cons.length === 0) && (
                      <li className="italic text-zinc-400">None parsed</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Custom AI Interview Questions */}
              {fullCandidate.interviewQuestions &&
                fullCandidate.interviewQuestions.length > 0 && (
                  <div className="space-y-3 border-t border-zinc-150 dark:border-zinc-800 pt-6">
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      AI Interview Questions Guide
                    </h4>
                    <div className="space-y-3">
                      {fullCandidate.interviewQuestions.map(
                        (iq: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                          >
                            <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold mb-1 uppercase tracking-wider">
                              <span>Question {idx + 1}</span>
                              <span className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                                Focus: {iq.focusArea}
                              </span>
                            </div>
                            <p className="font-bold text-zinc-800 dark:text-zinc-250 leading-relaxed">
                              "{iq.question}"
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Action Gates */}
            <div className="p-6 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-wrap gap-2 justify-end select-none">
              {fullCandidate.stage !== "rejected" && (
                <Button
                  variant="outline"
                  className="h-8 text-xxs font-bold text-red-600 border-red-200 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/30"
                  onClick={() => moveCandidate(fullCandidate._id, "rejected")}
                  disabled={updateCandidateStageMutation.isPending}
                >
                  Reject Candidate
                </Button>
              )}
              {fullCandidate.stage === "applied" && (
                <Button
                  className="h-8 text-xxs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => moveCandidate(fullCandidate._id, "screened")}
                  disabled={updateCandidateStageMutation.isPending}
                >
                  Screen Profile
                </Button>
              )}
              {fullCandidate.stage === "screened" && (
                <Button
                  className="h-8 text-xxs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => moveCandidate(fullCandidate._id, "interviewing")}
                  disabled={updateCandidateStageMutation.isPending}
                >
                  Invite to Interview
                </Button>
              )}
              {fullCandidate.stage === "interviewing" && (
                <Button
                  className="h-8 text-xxs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => moveCandidate(fullCandidate._id, "offered")}
                  disabled={updateCandidateStageMutation.isPending}
                >
                  Extend Job Offer
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-zinc-400 italic">
            Failed to load candidate details.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
