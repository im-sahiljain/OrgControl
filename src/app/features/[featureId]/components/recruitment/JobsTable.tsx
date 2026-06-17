"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Loader2,
  MoreHorizontal,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobsTableProps {
  jobs: any[];
  loadingJobs: boolean;
  orgId: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  onResetFilters: () => void;
  setSelectedJobId: (id: string) => void;
  setActiveTab: (tab: any) => void;
  handleEditClick: (job: any) => void;
  handleToggleStatusClick: (job: any) => void;
}

type SortColumn =
  | "title"
  | "department"
  | "location"
  | "type"
  | "status"
  | "applicantCount"
  | null;

type SortDirection = "asc" | "desc" | null;

export const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  loadingJobs,
  orgId,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  onResetFilters,
  setSelectedJobId,
  setActiveTab,
  handleEditClick,
  handleToggleStatusClick,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const jobTypes = useMemo(
    () =>
      Array.from(new Set(jobs.map((job) => job.type).filter(Boolean))).sort(),
    [jobs],
  );

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      if (!sortColumn || !sortDirection) {
        return 0;
      }

      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (sortColumn === "applicantCount") {
        const diff = (aValue ?? 0) - (bValue ?? 0);
        return sortDirection === "asc" ? diff : -diff;
      }

      const left = String(aValue ?? "").toLowerCase();
      const right = String(bValue ?? "").toLowerCase();
      const result = left.localeCompare(right);

      return sortDirection === "asc" ? result : -result;
    });
  }, [jobs, sortColumn, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sortedJobs.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const paginatedJobs = React.useMemo(
    () =>
      sortedJobs.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage,
      ),
    [sortedJobs, currentPage, rowsPerPage],
  );

  const toggleSort = (column: SortColumn) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection("asc");
      return;
    }

    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }

    setSortColumn(null);
    setSortDirection(null);
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column || !sortDirection) {
      return <ArrowUpDown className="size-4 text-zinc-400" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp className="size-4 text-zinc-700" />
    ) : (
      <ArrowDown className="size-4 text-zinc-700" />
    );
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Input
            placeholder="Filter jobs..."
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="min-w-0 flex-1"
          />

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-8 w-36 min-w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="h-8 w-36 min-w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="all">All Types</SelectItem>
              {jobTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={onResetFilters}
          >
            Reset
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {sortedJobs.length} job{sortedJobs.length === 1 ? "" : "s"}
        </div>
      </div>

      <Table className="min-w-195">
        <TableHeader className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-xxs uppercase tracking-[0.08em]">
          <TableRow>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-left"
                onClick={() => toggleSort("title")}
              >
                Job Title / Department {renderSortIcon("title")}
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-left"
                onClick={() => toggleSort("location")}
              >
                Location {renderSortIcon("location")}
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-left"
                onClick={() => toggleSort("type")}
              >
                Type {renderSortIcon("type")}
              </button>
            </TableHead>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-left"
                onClick={() => toggleSort("status")}
              >
                Status {renderSortIcon("status")}
              </button>
            </TableHead>
            <TableHead className="text-center">
              <button
                type="button"
                className="inline-flex items-center gap-2"
                onClick={() => toggleSort("applicantCount")}
              >
                Applicants {renderSortIcon("applicantCount")}
              </button>
            </TableHead>
            <TableHead>Public Link</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingJobs ? (
            <TableRow>
              <TableCell colSpan={7} className="p-10 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-600" />
              </TableCell>
            </TableRow>
          ) : sortedJobs.length > 0 ? (
            paginatedJobs.map((job: any) => (
              <TableRow key={job._id}>
                <TableCell>
                  <div className="font-semibold text-zinc-950 dark:text-zinc-50">
                    {job.title}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {job.department}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2 text-zinc-550">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2 text-zinc-550">
                    <Clock className="h-4 w-4" />
                    <span>{job.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
                      job.status === "active"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-900/50"
                    }`}
                  >
                    {job.status === "active" ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-center font-semibold text-zinc-700 dark:text-zinc-300">
                  {job.applicantCount ?? 0}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/${orgId}/${job._id}/application`}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                  >
                    Apply Portal <ArrowRight className="h-3 w-3" />
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xxs font-semibold px-3"
                      onClick={() => {
                        setSelectedJobId(job._id);
                        setActiveTab("candidates");
                      }}
                    >
                      View Pipeline
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xxs font-semibold text-zinc-700 dark:text-zinc-300 border-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3"
                      onClick={() => handleEditClick(job)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 text-xxs font-semibold px-3 ${
                        job.status === "active"
                          ? "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 border-amber-200/50 hover:bg-amber-50/20"
                          : "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 border-emerald-200/50 hover:bg-emerald-50/20"
                      }`}
                      onClick={() => handleToggleStatusClick(job)}
                    >
                      {job.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                    <details className="relative inline-block text-left">
                      <summary className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden">
                        <MoreHorizontal className="h-4 w-4" />
                      </summary>
                      <div className="absolute right-0 z-20 mt-2 min-w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                          onClick={() => {
                            setSelectedJobId(job._id);
                            setActiveTab("candidates");
                          }}
                        >
                          View Pipeline
                        </button>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                          onClick={() => handleEditClick(job)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                          onClick={() => handleToggleStatusClick(job)}
                        >
                          {job.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </details>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="p-8 text-center text-zinc-400 italic"
              >
                No job postings created.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span>Rows per page</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(value) => setRowsPerPage(Number(value))}
          >
            <SelectTrigger className="h-8 w-24">
              <SelectValue placeholder="20" />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {[10, 20, 50, 100].map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400 md:flex-row md:items-center">
          <div>
            Page {currentPage + 1} of {pageCount}
          </div>
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
              onClick={() => setPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}
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
  );
};
