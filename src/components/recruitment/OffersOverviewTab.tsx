"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateDetailsDrawer } from "./CandidateDetailsDrawer";
import toast from "react-hot-toast";

interface OffersOverviewTabProps {
  orgId: string;
  jobs: any[];
}

export const OffersOverviewTab: React.FC<OffersOverviewTabProps> = ({
  orgId,
  jobs,
}) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );

  // 1. Fetch Candidates in Offered / Hired stages
  const {
    data: candidates = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["offers-overview-candidates", orgId],
    queryFn: async () => {
      const res = await axios.get(`/api/candidates?orgId=${orgId}&all=true`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  // Filter candidates to those with offers extended or hired
  const offerCandidates = candidates.filter((c: any) => {
    const stage = (c.stage || "").toLowerCase();
    return stage === "offered" || stage === "hired";
  });

  const filteredOffers = offerCandidates.filter((cand: any) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cand.name?.toLowerCase().includes(q);
      const matchEmail = cand.email?.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }

    if (statusFilter !== "all") {
      if (statusFilter === "offered" && cand.stage !== "offered") return false;
      if (statusFilter === "hired" && cand.stage !== "hired") return false;
    }

    return true;
  });

  const totalOffersCount = offerCandidates.length;
  const activeOffersCount = offerCandidates.filter(
    (c: any) => c.stage === "offered",
  ).length;
  const hiredOffersCount = offerCandidates.filter(
    (c: any) => c.stage === "hired",
  ).length;
  const acceptanceRate = totalOffersCount
    ? Math.round((hiredOffersCount / totalOffersCount) * 100)
    : 0;

  const selectedCandidate = candidates.find(
    (c: any) => c._id === selectedCandidateId,
  );

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Total Job Offers
          </span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {totalOffersCount} Extended
          </p>
          <span className="text-xxs text-zinc-400 font-semibold block">
            Across all active positions
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Pending Decision
          </span>
          <p className="text-2xl font-extrabold text-emerald-600">
            {activeOffersCount} Pending
          </p>
          <span className="text-xxs text-emerald-600 font-semibold block">
            Awaiting candidate acceptance
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Hired & Accepted
          </span>
          <p className="text-2xl font-extrabold text-teal-600">
            {hiredOffersCount} Candidates
          </p>
          <span className="text-xxs text-teal-600 font-semibold block">
            Successfully onboarded
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
            Offer Acceptance Rate
          </span>
          <p className="text-2xl font-extrabold text-violet-600">
            {acceptanceRate}%
          </p>
          <span className="text-xxs text-violet-500 font-semibold block">
            Offer-to-Hire conversion
          </span>
        </div>
      </div>

      {/* Offers Overview Table Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Table Filters Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-100 dark:border-emerald-900">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                Issued Job Offers & Hiring Pipeline
              </h3>
              <p className="text-xs text-zinc-500">
                Track candidate responses, compensation offers, and onboarding
                status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px]">
              <Input
                placeholder="Search candidate or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Offer Status" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectItem value="all">All Offers</SelectItem>
                <SelectItem value="offered">Pending Offered</SelectItem>
                <SelectItem value="hired">Hired / Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Offers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-400 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="p-3">No.</th>
                <th className="p-3">Candidate Name</th>
                <th className="p-3">Target Job Vacancy</th>
                <th className="p-3">AI Score</th>
                <th className="p-3">Offer Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-6" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-40" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredOffers.length > 0 ? (
                filteredOffers.map((cand: any, idx: number) => {
                  const jobTitle =
                    jobs.find((j: any) => j._id === cand.jobId)?.title ||
                    "Vacancy Position";
                  return (
                    <tr
                      key={cand._id}
                      onClick={() => setSelectedCandidateId(cand._id)}
                      className="cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-850/50 transition-colors"
                    >
                      <td className="p-3 font-mono text-zinc-400 font-semibold">
                        {idx + 1}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">
                          {cand.name}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {cand.email}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-zinc-700 dark:text-zinc-300 max-w-[180px] truncate">
                        {jobTitle}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-extrabold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <Sparkles className="h-3 w-3" />
                          {cand.matchScore}%
                        </span>
                      </td>
                      <td className="p-3">
                        {cand.stage === "hired" ? (
                          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-900 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="h-3 w-3" />
                            Accepted & Hired
                          </span>
                        ) : cand.offerStatus === "accepted" ? (
                          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-900 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="h-3 w-3" />
                            Offer Accepted
                          </span>
                        ) : cand.offerStatus === "declined" ? (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            Offer Declined
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            <Clock className="h-3 w-3 animate-pulse" />
                            Pending Response
                          </span>
                        )}
                      </td>
                      <td
                        className="p-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {cand.offerToken &&
                            cand.offerStatus === "pending" && (
                              <button
                                onClick={() => {
                                  const url = `${window.location.origin}/offer/${cand.offerToken}`;
                                  navigator.clipboard.writeText(url);
                                  toast.success("Public offer link copied!");
                                }}
                                className="font-bold text-emerald-600 hover:underline text-[11px]"
                              >
                                Copy Link
                              </button>
                            )}
                          <button
                            onClick={() => setSelectedCandidateId(cand._id)}
                            className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            View Details <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-zinc-400 italic"
                  >
                    No job offers extended yet. Click "Extend Job Offer" on
                    candidate profiles to issue offers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Details Drawer */}
      {selectedCandidate && (
        <CandidateDetailsDrawer
          selectedCandidateId={selectedCandidate._id}
          setSelectedCandidateId={() => setSelectedCandidateId(null)}
          loadingDetails={false}
          fullCandidate={selectedCandidate}
          updateCandidateStageMutation={{ isPending: false }}
          moveCandidate={async (candidateId, newStage) => {
            try {
              await axios.put("/api/candidates", {
                id: candidateId,
                stage: newStage,
              });
              setSelectedCandidateId(null);
              toast.success(`Candidate marked as ${newStage}`);
              queryClient.invalidateQueries({
                queryKey: ["offers-overview-candidates"],
              });
              queryClient.invalidateQueries({
                queryKey: ["recruitment-candidates"],
              });
              refetch();
            } catch {
              toast.error("Failed to update candidate stage");
            }
          }}
        />
      )}
    </div>
  );
};
