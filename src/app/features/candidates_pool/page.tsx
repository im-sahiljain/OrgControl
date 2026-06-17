"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Loader2,
  X,
  Eye,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RootState } from "@/app/reduxToolkit/store";

interface CandidatePoolResponse {
  success: boolean;
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface CandidateDetailResponse {
  success: boolean;
  data: any;
}

const stageOptions = [
  { value: "all", label: "All stages" },
  { value: "applied", label: "Applied" },
  { value: "screened", label: "Screened" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offered", label: "Offered" },
  { value: "rejected", label: "Rejected" },
];

const screeningOptions = [
  { value: "all", label: "Any screening" },
  { value: "true", label: "AI screened" },
  { value: "false", label: "Needs screening" },
];

const pageSizeOptions = [10, 20, 50];

function stageBadge(stage: string) {
  const base =
    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize border";
  let classes = "";
  switch (stage) {
    case "applied":
      classes = `${base} bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50`;
      break;
    case "screened":
      classes = `${base} bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-900/50`;
      break;
    case "interviewing":
      classes = `${base} bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/50`;
      break;
    case "offered":
      classes = `${base} bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/50`;
      break;
    case "rejected":
      classes = `${base} bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900/50`;
      break;
    default:
      classes = `${base} bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/70 dark:text-zinc-300 dark:border-zinc-800`;
  }
  return <span className={classes}>{stage}</span>;
}

const CandidateDetailsModal = ({
  candidate,
  loading,
  onClose,
  jobs = [],
}: {
  candidate: any;
  loading: boolean;
  onClose: () => void;
  jobs?: any[];
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative mx-auto max-w-4xl rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
              Candidate profile
            </p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-100">
              {candidate?.name || "Loading candidate..."}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {candidate?.email || "..."} · {candidate?.phone || "..."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            <div className="h-5 w-48 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-24 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-24 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
            <div className="h-36 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-40 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="h-40 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            </div>
            <div className="h-40 rounded-3xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        ) : (
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                    Stage
                  </p>
                  <div className="mt-3">
                    {stageBadge(candidate?.stage || "")}
                  </div>
                </div>
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                    Match score
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {candidate?.matchScore ?? 0}%
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  Candidate summary
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300 min-h-[6rem]">
                  {candidate.summary || "No candidate summary available."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                    Strengths
                  </div>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    {candidate.pros?.length ? (
                      candidate.pros.map((pro: string, idx: number) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>{pro}</span>
                        </li>
                      ))
                    ) : (
                      <li className="italic text-zinc-400">
                        No strengths parsed
                      </li>
                    )}
                  </ul>
                </div>
                <div className="space-y-2 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                    Opportunities
                  </div>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    {candidate.cons?.length ? (
                      candidate.cons.map((con: string, idx: number) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span>{con}</span>
                        </li>
                      ))
                    ) : (
                      <li className="italic text-zinc-400">No gaps captured</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <ShieldCheck className="h-4 w-4 text-sky-500" />
                  Interview questions
                </div>
                <div className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {candidate.interviewQuestions?.length ? (
                    candidate.interviewQuestions.map(
                      (question: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 p-4"
                        >
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {question.question}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                            Focus area: {question.focusArea}
                          </p>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="italic text-zinc-400">
                      No interview questions available.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 p-5 text-sm text-zinc-600 dark:text-zinc-300">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                  Job reference
                </p>
                <p>
                  {jobs.find((j: any) => j._id === candidate.jobId)?.title ||
                    candidate.jobId ||
                    "Not assigned"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills?.length ? (
                    candidate.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="rounded-full bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="italic text-zinc-400">
                      No skills captured
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                  Resume
                </p>
                {candidate.resumeUrl ? (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    View resume
                  </a>
                ) : (
                  <p className="italic text-zinc-400">Not available</p>
                )}
              </div>
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                  AI screening status
                </p>
                <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {candidate.isAiScreened ? "Completed" : "Pending"}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CandidatesPoolPage() {
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [screeningFilter, setScreeningFilter] = useState("all");
  const [jobIdFilter, setJobIdFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, stageFilter, screeningFilter, jobIdFilter, limit]);

  const jobsQuery = useQuery<any[]>({
    queryKey: ["jobsPool", orgId],
    queryFn: async () => {
      const response = await axios.get(`/api/jobs?orgId=${orgId}&all=true`);
      return response.data.data ?? [];
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 5,
  });

  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data]);

  const queryKey = useMemo(
    () => [
      "candidatesPool",
      orgId,
      searchQuery,
      stageFilter,
      screeningFilter,
      jobIdFilter,
      page,
      limit,
    ],
    [
      orgId,
      searchQuery,
      stageFilter,
      screeningFilter,
      jobIdFilter,
      page,
      limit,
    ],
  );

  const candidatesQuery = useQuery<CandidatePoolResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("orgId", String(orgId));
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (searchQuery) params.set("search", searchQuery);
      if (stageFilter !== "all") params.set("stage", stageFilter);
      if (screeningFilter !== "all")
        params.set("isAiScreened", screeningFilter);
      if (jobIdFilter !== "all") params.set("jobId", jobIdFilter);

      const response = await axios.get(`/api/candidates?${params.toString()}`);
      return response.data;
    },
    enabled: Boolean(orgId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const selectedCandidateQuery = useQuery<any>({
    queryKey: ["candidateDetail", selectedCandidateId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("orgId", String(orgId));
      params.set("id", String(selectedCandidateId));
      const response = await axios.get(`/api/candidates?${params.toString()}`);
      return response.data.data;
    },
    enabled: Boolean(orgId && selectedCandidateId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const candidates = useMemo(
    () => candidatesQuery.data?.data ?? [],
    [candidatesQuery.data],
  );
  const pagination = useMemo(
    () =>
      candidatesQuery.data?.pagination ?? { total: 0, page, limit, pages: 1 },
    [candidatesQuery.data, page, limit],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Candidates Pool
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                  High-volume candidate table with backend search and fast
                  review.
                </p>
              </div>
            </div>
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {candidatesQuery.isFetching ? (
                <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-300">
                  <Loader2 className="h-4 w-4 animate-spin" /> Refreshing
                </span>
              ) : (
                <span>{pagination.total.toLocaleString()} candidates</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-zinc-200 dark:border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap flex-1 items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, phone, skills..."
                className="pl-9 h-8 text-xs"
              />
              <Search className="absolute left-3 top-2 h-4 w-4 text-zinc-450" />
            </div>

            <Select value={jobIdFilter} onValueChange={setJobIdFilter}>
              <SelectTrigger className="h-8 w-44 min-w-44 text-xs">
                <SelectValue placeholder="All jobs" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectItem value="all">All jobs</SelectItem>
                {jobs.map((job: any) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="h-8 w-36 min-w-36 text-xs">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                {stageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={screeningFilter} onValueChange={setScreeningFilter}>
              <SelectTrigger className="h-8 w-36 min-w-36 text-xs">
                <SelectValue placeholder="Any screening" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                {screeningOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => {
                setSearchInput("");
                setStageFilter("all");
                setScreeningFilter("all");
                setJobIdFilter("all");
                setLimit(20);
                setPage(1);
              }}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3 gap-1 flex items-center cursor-pointer"
              onClick={() => {
                candidatesQuery.refetch().then((result) => {
                  if (result.isError) {
                    toast.error("Failed to refresh candidates pool.");
                  } else {
                    toast.success("Candidates pool refreshed successfully.");
                  }
                });
              }}
              disabled={candidatesQuery.isFetching}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  candidatesQuery.isFetching ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
          {candidatesQuery.isLoading ? (
            <div className="space-y-4 p-6">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-900 animate-pulse"
                />
              ))}
            </div>
          ) : candidatesQuery.isError ? (
            <div className="p-6 text-center text-sm text-red-500">
              Failed to load candidate pool. Please refresh the page.
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No candidates match the current filters.
            </div>
          ) : (
            <Table className="min-w-full">
              <TableHeader className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-xxs uppercase tracking-[0.08em]">
                <TableRow>
                  <TableHead className="w-12 text-center">No.</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Job Posting</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">AI Screened</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate: any, index: number) => (
                  <TableRow
                    key={candidate._id || candidate.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/70"
                  >
                    <TableCell className="text-center font-semibold text-zinc-400 dark:text-zinc-500">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {candidate.name}
                    </TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400">
                      {candidate.email}
                    </TableCell>
                    <TableCell className="font-semibold text-zinc-700 dark:text-zinc-350 max-w-[12rem] truncate">
                      {jobs.find((j: any) => j._id === candidate.jobId)
                        ?.title || "—"}
                    </TableCell>
                    <TableCell className="max-w-[20rem] truncate text-zinc-600 dark:text-zinc-400">
                      {candidate.skills?.slice(0, 4).join(", ") || "—"}
                    </TableCell>
                    <TableCell>{stageBadge(candidate.stage)}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${candidate.isAiScreened ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
                      >
                        {candidate.isAiScreened ? "Yes" : "No"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xxs font-semibold px-3"
                          onClick={() =>
                            setSelectedCandidateId(
                              candidate._id || candidate.id,
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Rows per page</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="h-8 w-24">
                <SelectValue placeholder="20" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                {[10, 20, 50].map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col items-start gap-3 text-sm text-zinc-605 dark:text-zinc-400 md:flex-row md:items-center">
            <div>
              Page {page} of {pagination.pages || 1}
            </div>
            <div className="inline-flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage(1)}
                disabled={page <= 1 || candidatesQuery.isFetching}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1 || candidatesQuery.isFetching}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, pagination.pages || 1))
                }
                disabled={
                  page >= (pagination.pages || 1) || candidatesQuery.isFetching
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage(pagination.pages || 1)}
                disabled={
                  page >= (pagination.pages || 1) || candidatesQuery.isFetching
                }
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedCandidateId && (
        <CandidateDetailsModal
          candidate={selectedCandidateQuery.data}
          loading={
            selectedCandidateQuery.isLoading ||
            selectedCandidateQuery.isFetching
          }
          onClose={() => setSelectedCandidateId(null)}
          jobs={jobs}
        />
      )}
    </div>
  );
}
