"use client";

import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateDetailsDrawer } from "@/components/recruitment/CandidateDetailsDrawer";
import toast from "react-hot-toast";

interface TopCandidatesTableProps {
  candidates: any[];
  isLoading: boolean;
}

export const TopCandidatesTable: React.FC<TopCandidatesTableProps> = ({
  candidates,
  isLoading,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [screeningFilter, setScreeningFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter candidates based on Search Input, Stage, and Screening filters
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand: any) => {
      // 1. Search Query filter (Name, Email, Phone, Skills)
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchName = cand.name?.toLowerCase().includes(query);
        const matchEmail = cand.email?.toLowerCase().includes(query);
        const matchPhone = cand.phone?.toLowerCase().includes(query);
        const matchSkills =
          Array.isArray(cand.skills) &&
          cand.skills.some((s: string) => s.toLowerCase().includes(query));
        if (!matchName && !matchEmail && !matchPhone && !matchSkills)
          return false;
      }

      // 2. Stage filter
      if (stageFilter !== "all") {
        const candidateStage = (cand.stage || "applied").toLowerCase();
        if (!candidateStage.includes(stageFilter.toLowerCase())) return false;
      }

      // 3. Screening filter
      if (screeningFilter !== "all") {
        if (screeningFilter === "screened" && !cand.isAiScreened) return false;
        if (screeningFilter === "unscreened" && cand.isAiScreened) return false;
      }

      return true;
    });
  }, [candidates, searchFilter, stageFilter, screeningFilter]);

  // Sort filtered candidates by Match Score
  const sortedCandidates = useMemo(() => {
    return [...filteredCandidates].sort(
      (a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0),
    );
  }, [filteredCandidates]);

  const highMatchCount = useMemo(() => {
    return candidates.filter((c: any) => c.matchScore >= 75).length;
  }, [candidates]);

  const totalCount = sortedCandidates.length;
  const pageCount = Math.max(Math.ceil(totalCount / rowsPerPage), 1);
  const currentPage = Math.min(page, pageCount - 1);

  const paginatedCandidates = useMemo(() => {
    const start = currentPage * rowsPerPage;
    return sortedCandidates.slice(start, start + rowsPerPage);
  }, [sortedCandidates, currentPage, rowsPerPage]);

  const resetFilters = () => {
    setSearchFilter("");
    setStageFilter("all");
    setScreeningFilter("all");
    setPage(0);
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Header Title */}
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Top Candidate Profiles & AI Leaderboard
            </h3>
            <p className="text-xs text-zinc-500">
              Highest scoring applicants evaluated for this job vacancy. Click
              any candidate to view detailed AI analysis.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-900">
            {highMatchCount} High Match Candidates
          </span>
        </div>

        {/* Filters Toolbar Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-zinc-50/50 dark:bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-850">
          <div className="relative min-w-[220px] flex-1">
            <Input
              placeholder="Filter candidates by name, email, skills..."
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setPage(0);
              }}
              className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          </div>

          <Select
            value={stageFilter}
            onValueChange={(val) => {
              setStageFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="h-8 w-36 text-xs bg-white dark:bg-zinc-900">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screened">Screened</SelectItem>
              <SelectItem value="interview">Interviewing</SelectItem>
              <SelectItem value="offer">Offered</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="reject">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={screeningFilter}
            onValueChange={(val) => {
              setScreeningFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="h-8 w-36 text-xs bg-white dark:bg-zinc-900">
              <SelectValue placeholder="All Screening" />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="all">All Screening</SelectItem>
              <SelectItem value="screened">AI Screened</SelectItem>
              <SelectItem value="unscreened">Needs Screening</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs px-3"
            onClick={resetFilters}
          >
            Reset
          </Button>

          <div className="text-xs text-zinc-400 font-medium ml-auto">
            {totalCount} candidate{totalCount === 1 ? "" : "s"}
          </div>
        </div>

        {/* Candidates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-400 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Candidate Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">AI Match Score</th>
                <th className="p-3">Current Stage</th>
                <th className="p-3">Key Skills</th>
                <th className="p-3 text-right">Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
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
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-48" />
                    </td>
                    <td className="p-3">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : paginatedCandidates.length > 0 ? (
                paginatedCandidates.map((cand: any, idx: number) => {
                  const globalRank = currentPage * rowsPerPage + idx + 1;
                  return (
                    <tr
                      key={cand._id}
                      onClick={() => setSelectedCandidate(cand)}
                      className="cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-850/50 transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-zinc-400">
                        #{globalRank}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">
                          {cand.name}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {cand.email}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">
                        {cand.phone || "—"}
                      </td>
                      <td className="p-3">
                        {cand.isAiScreened ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-extrabold text-[11px] ${
                              cand.matchScore >= 90
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : cand.matchScore >= 75
                                  ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400"
                                  : cand.matchScore >= 50
                                    ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
                                    : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                            }`}
                          >
                            <Sparkles className="h-3 w-3" />
                            {cand.matchScore}%
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold border border-amber-200">
                            Pending AI
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="capitalize font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          {cand.stage || "applied"}
                        </span>
                      </td>
                      <td className="p-3 max-w-[200px] truncate">
                        {Array.isArray(cand.skills) &&
                        cand.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {cand.skills.slice(0, 3).map((sk: string) => (
                              <span
                                key={sk}
                                className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] px-1.5 py-0.5 rounded"
                              >
                                {sk}
                              </span>
                            ))}
                            {cand.skills.length > 3 && (
                              <span className="text-[10px] text-zinc-400">
                                +{cand.skills.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">
                            No skills listed
                          </span>
                        )}
                      </td>
                      <td
                        className="p-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cand.resumeUrl ? (
                          <a
                            href={cand.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-blue-600 hover:underline"
                          >
                            View Resume
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-zinc-400 italic"
                  >
                    No candidates match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-3 border-t border-zinc-150 dark:border-zinc-800 pt-4 md:flex-row md:items-center md:justify-between text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(value) => {
                setRowsPerPage(Number(value));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                {[5, 10, 20, 50].map((val) => (
                  <SelectItem key={val} value={String(val)}>
                    {val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Page {currentPage + 1} of {pageCount} ({totalCount} candidates)
            </span>
            <div className="inline-flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage(0)}
                disabled={currentPage === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() =>
                  setPage((prev) => Math.min(pageCount - 1, prev + 1))
                }
                disabled={currentPage >= pageCount - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage(pageCount - 1)}
                disabled={currentPage >= pageCount - 1}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Details Drawer Slide-over */}
      {selectedCandidate && (
        <CandidateDetailsDrawer
          selectedCandidateId={selectedCandidate._id}
          setSelectedCandidateId={() => setSelectedCandidate(null)}
          loadingDetails={false}
          fullCandidate={selectedCandidate}
          updateCandidateStageMutation={{ isPending: false }}
          moveCandidate={async (candidateId, newStage) => {
            try {
              await axios.put("/api/candidates", {
                id: candidateId,
                stage: newStage,
              });
              setSelectedCandidate((prev: any) =>
                prev ? { ...prev, stage: newStage } : null,
              );
              toast.success(`Candidate marked as ${newStage}`);
            } catch {
              toast.error("Failed to update candidate stage");
            }
          }}
        />
      )}
    </>
  );
};
