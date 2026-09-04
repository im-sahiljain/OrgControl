import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  X,
  FileText,
  Sparkles,
  Check,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfferModal } from "@/components/recruitment/OfferModal";
import { OnboardEmployeeModal } from "@/components/recruitment/OnboardEmployeeModal";
import toast from "react-hot-toast";
import axios from "axios";

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
  const queryClient = useQueryClient();
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

  if (!selectedCandidateId) return null;

  const stageBadgeColors: Record<string, string> = {
    applied: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    screening: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    interview: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300",
    offered: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    hired: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300",
    rejected: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
  };

  return (
    <motion.div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 h-screen w-screen bg-black/50 z-[100] flex justify-end overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-lg flex flex-col h-full max-h-screen overflow-hidden shadow-2xl z-[101]"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="space-y-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Candidate Profile
              </span>
              {fullCandidate?.stage && (
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    stageBadgeColors[fullCandidate.stage] || "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {fullCandidate.stage}
                </span>
              )}
            </div>
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

              {/* Extended Offer Status & Public Link Card */}
              {(fullCandidate.stage === "offered" || fullCandidate.stage === "hired" || fullCandidate.offerDetails) && (
                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200/50 dark:border-emerald-900/50 pb-3">
                    <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-emerald-600" /> Issued Employment Offer Details
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xxs font-extrabold capitalize border ${
                        fullCandidate.offerStatus === "accepted"
                          ? "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300"
                          : fullCandidate.offerStatus === "declined"
                          ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {fullCandidate.offerStatus ? `Offer ${fullCandidate.offerStatus}` : "Pending Response"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-zinc-400 block text-[10px] font-bold uppercase tracking-wider">Offered Role Title</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 block text-xs mt-0.5">
                        {fullCandidate.offerDetails?.designation || "Senior Software Engineer"}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-zinc-400 block text-[10px] font-bold uppercase tracking-wider">Annual CTC (INR)</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 block text-xs mt-0.5 font-extrabold">
                        {fullCandidate.offerDetails?.salary ? (fullCandidate.offerDetails.salary.includes("₹") ? fullCandidate.offerDetails.salary : `₹ ${fullCandidate.offerDetails.salary}`) : "As Agreed"}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-zinc-400 block text-[10px] font-bold uppercase tracking-wider">Target Joining Date</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 block text-xs mt-0.5">
                        {fullCandidate.offerDetails?.joiningDate || "Immediate"}
                      </strong>
                    </div>

                    <div className="p-2.5 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-zinc-400 block text-[10px] font-bold uppercase tracking-wider">Offer Expiry Date</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 block text-xs mt-0.5">
                        {fullCandidate.offerDetails?.expiryDate || "Standard 7 Days"}
                      </strong>
                    </div>
                  </div>

                  {fullCandidate.offerDetails?.notes && (
                    <div className="p-3 bg-white/60 dark:bg-zinc-900/60 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Special Perks & Notes</span>
                      <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                        {fullCandidate.offerDetails.notes}
                      </p>
                    </div>
                  )}

                  {fullCandidate.offerToken && (
                    <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-900/50 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-500 font-semibold truncate">
                        Secure Candidate Portal Link Generated
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xxs font-bold bg-white dark:bg-zinc-900 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => {
                          const url = `${window.location.origin}/offer/${fullCandidate.offerToken}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Public offer link copied!");
                        }}
                      >
                        Copy Link
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Show Screening & Interview AI Evaluation ONLY for early stage candidates (applied, screened, interviewing) */}
              {fullCandidate.stage !== "offered" && fullCandidate.stage !== "hired" && (
                <>
                  {/* Candidate Screening Summary */}
                  {fullCandidate.summary && (
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" /> AI Profile Screening Summary
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed p-3 bg-zinc-50 dark:bg-zinc-950/30 rounded-lg border border-zinc-100 dark:border-zinc-850">
                        {fullCandidate.summary}
                      </p>
                    </div>
                  )}

                  {/* Skills breakdown */}
                  {fullCandidate.skills && fullCandidate.skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-200">
                        Extracted Skills Inventory
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {fullCandidate.skills.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md font-medium text-xxs border border-zinc-200 dark:border-zinc-700/60"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pros & Cons list */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {fullCandidate.pros && fullCandidate.pros.length > 0 && (
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl space-y-2">
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 text-xxs uppercase tracking-wider">
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> Match Strengths
                        </h4>
                        <ul className="space-y-1">
                          {fullCandidate.pros.map((pro: string, idx: number) => (
                            <li key={idx} className="text-zinc-700 dark:text-zinc-300 text-xxs flex items-start gap-1">
                              <span className="text-emerald-500">•</span> {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {fullCandidate.cons && fullCandidate.cons.length > 0 && (
                      <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl space-y-2">
                        <h4 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1 text-xxs uppercase tracking-wider">
                          <X className="h-3.5 w-3.5 text-rose-600" /> Match Gaps
                        </h4>
                        <ul className="space-y-1">
                          {fullCandidate.cons.map((con: string, idx: number) => (
                            <li key={idx} className="text-zinc-700 dark:text-zinc-300 text-xxs flex items-start gap-1">
                              <span className="text-rose-500">•</span> {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Suggested Interview Questions */}
                  {fullCandidate.interviewQuestions && fullCandidate.interviewQuestions.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-200">
                        Recommended AI Interview Screening Questions
                      </h4>
                      <div className="space-y-2">
                        {fullCandidate.interviewQuestions.map((q: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850 rounded-xl text-zinc-700 dark:text-zinc-300 text-xxs flex gap-2"
                          >
                            <span className="font-bold text-blue-600 dark:text-blue-400">Q{idx + 1}.</span>
                            <span>{typeof q === 'string' ? q : q.question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Actions Footer */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center justify-between gap-3">
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xxs font-bold"
                onClick={() => {
                  moveCandidate(fullCandidate._id, "rejected");
                  setSelectedCandidateId(null);
                }}
              >
                Reject Candidate
              </Button>

              {fullCandidate.stage !== "offered" && fullCandidate.stage !== "hired" ? (
                <Button
                  size="sm"
                  className="h-8 text-xxs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1"
                  onClick={() => setIsOfferModalOpen(true)}
                >
                  Extend Job Offer Package <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                fullCandidate.stage === "offered" && (
                  fullCandidate.offerStatus === "accepted" ? (
                    <Button
                      size="sm"
                      className="h-8 text-xxs font-bold bg-teal-600 hover:bg-teal-700 text-white gap-1"
                      onClick={() => setIsOnboardModalOpen(true)}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Onboard as Employee
                    </Button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xxs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900"
                        onClick={() => setIsOfferModalOpen(true)}
                      >
                        Edit Offer Package
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xxs font-bold text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900"
                        onClick={async () => {
                          let token = fullCandidate.offerToken;
                          if (!token) {
                            token = crypto.randomUUID
                              ? crypto.randomUUID()
                              : Math.random().toString(36).substring(2) + Date.now().toString(36);
                            await axios.put("/api/candidates", {
                              id: fullCandidate._id,
                              offerToken: token,
                            });
                          }
                          const url = `${window.location.origin}/offer/${token}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Public offer link copied to clipboard!");
                        }}
                      >
                        Copy Offer Link
                      </Button>
                      <span className="text-xxs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Awaiting Candidate Acceptance
                      </span>
                    </div>
                  )
                )
              )}

              {/* Stage 5: Hired -> Finalized badge */}
              {fullCandidate.stage === "hired" && (
                <span className="text-xxs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900 px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Onboarded & Hired
                </span>
              )}
            </div>

            {/* Offer Modal Form */}
            <OfferModal
              candidate={fullCandidate}
              isOpen={isOfferModalOpen}
              onClose={() => setIsOfferModalOpen(false)}
              onSubmitOffer={async (offerData) => {
                const tokenToSave =
                  offerData.offerToken ||
                  fullCandidate.offerToken ||
                  (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36));
                try {
                  const updatedOfferDetails = {
                    designation: offerData.designation,
                    salary: offerData.salary,
                    joiningDate: offerData.joiningDate,
                    expiryDate: offerData.expiryDate,
                    notes: offerData.notes,
                  };

                  await axios.put("/api/candidates", {
                    id: fullCandidate._id,
                    stage: "offered",
                    offerStatus: fullCandidate.offerStatus || "pending",
                    offerToken: tokenToSave,
                    offerDetails: updatedOfferDetails,
                  });
                  toast.success("Job offer package updated successfully!");

                  // Update React Query cache immediately for candidate details
                  queryClient.setQueriesData(
                    { queryKey: ["candidate-details"] },
                    (oldData: any) => {
                      if (!oldData) return oldData;
                      return {
                        ...oldData,
                        stage: "offered",
                        offerStatus: oldData.offerStatus || "pending",
                        offerToken: tokenToSave,
                        offerDetails: updatedOfferDetails,
                      };
                    }
                  );

                  await queryClient.invalidateQueries({ queryKey: ["recruitment-candidates"] });
                  await queryClient.invalidateQueries({ queryKey: ["offers-overview-candidates"] });
                  await queryClient.invalidateQueries({ queryKey: ["candidate-details"] });
                } catch {
                  toast.error("Failed to save offer details");
                } finally {
                  setIsOfferModalOpen(false);
                }
              }}
              isSubmitting={updateCandidateStageMutation.isPending}
            />

            {/* Onboard Employee Modal */}
            <OnboardEmployeeModal
              candidate={fullCandidate}
              isOpen={isOnboardModalOpen}
              onClose={() => setIsOnboardModalOpen(false)}
              onSuccess={() => {
                moveCandidate(fullCandidate._id, "hired");
              }}
            />
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
