"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
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

const pageSizeOptions = [10, 20, 50];

function employeeStatusBadge(status: string) {
  const base =
    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize border";
  let classes = "";
  switch (status) {
    case "active":
      classes = `${base} bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/50`;
      break;
    case "onboarding":
      classes = `${base} bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50`;
      break;
    case "probation":
      classes = `${base} bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/50`;
      break;
    case "on_notice":
      classes = `${base} bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/50`;
      break;
    case "resigned":
    case "terminated":
      classes = `${base} bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900/50`;
      break;
    default:
      classes = `${base} bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/70 dark:text-zinc-300 dark:border-zinc-800`;
  }
  return <span className={classes}>{status.replace("_", " ")}</span>;
}

export default function EmployeesPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Fetch employees list
  const employeesQuery = useQuery({
    queryKey: ["employees", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await axios.get(`/api/employees?orgId=${orgId}`);
      return res.data.data || [];
    },
    enabled: !!orgId,
    staleTime: 1000 * 60 * 2,
  });

  const employeesList = useMemo(() => {
    return Array.isArray(employeesQuery.data) ? employeesQuery.data : [];
  }, [employeesQuery.data]);

  // Extract unique departments for filter dropdown
  const departmentOptions = useMemo(() => {
    const depts = new Set<string>();
    employeesList.forEach((e: any) => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts);
  }, [employeesList]);

  // Filter & Search Logic
  const filteredEmployees = useMemo(() => {
    return employeesList.filter((emp: any) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        emp.empName?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.empPosition?.toLowerCase().includes(q) ||
        emp.department?.toLowerCase().includes(q);

      const matchDept =
        departmentFilter === "all" || emp.department === departmentFilter;

      const matchStatus = statusFilter === "all" || emp.status === statusFilter;

      return matchSearch && matchDept && matchStatus;
    });
  }, [employeesList, search, departmentFilter, statusFilter]);

  // Pagination Logic
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = Math.min(page, totalPages);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredEmployees.slice(start, start + limit);
  }, [filteredEmployees, currentPage, limit]);

  return (
    <div className="space-y-6">
      {/* Outer Card Wrapper matching candidates-pool layout */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm overflow-hidden">
        {/* Header Block */}
        <div className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  Employees Directory
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                  Manage organization team members, roles, departments, and active statuses.
                </p>
              </div>
            </div>
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {employeesQuery.isFetching ? (
                <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
                  <Loader2 className="h-4 w-4 animate-spin" /> Refreshing
                </span>
              ) : (
                <span>{employeesList.length.toLocaleString()} employees</span>
              )}
            </div>
          </div>
        </div>

        {/* Filter Toolbar matching candidates-pool */}
        <div className="flex flex-col gap-3 border-b border-zinc-200 dark:border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap flex-1 items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1">
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email, role, department..."
                className="pl-9 h-8 text-xs"
              />
              <Search className="absolute left-3 top-2 h-4 w-4 text-zinc-450" />
            </div>

            {/* Department Filter */}
            <Select
              value={departmentFilter}
              onValueChange={(val) => {
                setDepartmentFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-44 min-w-44 text-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectItem value="all">All Departments</SelectItem>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-36 min-w-36 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
                <SelectItem value="on_notice">On Notice</SelectItem>
                <SelectItem value="resigned">Resigned</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => {
                setSearch("");
                setDepartmentFilter("all");
                setStatusFilter("all");
                setLimit(20);
                setPage(1);
              }}
            >
              Reset
            </Button>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3 gap-1 flex items-center cursor-pointer"
              onClick={() => {
                employeesQuery.refetch().then((result) => {
                  if (result.isError) {
                    toast.error("Failed to refresh employees.");
                  } else {
                    toast.success("Employees list refreshed successfully.");
                  }
                });
              }}
              disabled={employeesQuery.isFetching}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  employeesQuery.isFetching ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
          {employeesQuery.isLoading ? (
            <div className="space-y-4 p-6">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-900 animate-pulse"
                />
              ))}
            </div>
          ) : employeesQuery.isError ? (
            <div className="p-6 text-center text-sm text-red-500">
              Failed to load employees list. Please refresh the page.
            </div>
          ) : paginatedEmployees.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No employees match the current filters.
            </div>
          ) : (
            <Table className="min-w-full">
              <TableHeader className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-xxs uppercase tracking-[0.08em]">
                <TableRow>
                  <TableHead className="w-12 text-center">No.</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Position / Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Work Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Annual Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((emp: any, index: number) => {
                  const globalIndex = (currentPage - 1) * limit + index + 1;
                  return (
                    <TableRow
                      key={emp._id}
                      onClick={() => router.push(`/employees/${emp._id}`)}
                      className="cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-900/70 transition-colors"
                    >
                      <TableCell className="text-center font-semibold text-zinc-400 dark:text-zinc-500">
                        {globalIndex}
                      </TableCell>
                      <TableCell className="font-semibold text-zinc-950 dark:text-zinc-50">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-extrabold text-xs">
                            {emp.empName?.charAt(0) || "E"}
                          </div>
                          <span>{emp.empName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-zinc-700 dark:text-zinc-350 max-w-[12rem] truncate">
                        {emp.empPosition || "—"}
                      </TableCell>
                      <TableCell className="text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                          {emp.department || "Engineering"}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-500 dark:text-zinc-400">
                        {emp.email || "—"}
                      </TableCell>
                      <TableCell>
                        {employeeStatusBadge(emp.status || "active")}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-zinc-950 dark:text-zinc-50">
                        ₹ {(emp.salary || 80000).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer Pagination Bar matching candidates-pool */}
        <div className="flex flex-col gap-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span>Rows per page</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-24">
                <SelectValue placeholder="20" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                {pageSizeOptions.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col items-start gap-3 text-sm text-zinc-605 dark:text-zinc-400 md:flex-row md:items-center">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="inline-flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage(1)}
                disabled={currentPage <= 1 || employeesQuery.isFetching}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1 || employeesQuery.isFetching}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages || employeesQuery.isFetching}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setPage(totalPages)}
                disabled={currentPage >= totalPages || employeesQuery.isFetching}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

