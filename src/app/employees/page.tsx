"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import AddEmployees from "../components/AddEmployees";
import ShowEmployess from "../components/ShowEmployess";
import ManagePositions from "../components/ManagePositions";
import ManageDepartmentRoster from "../components/ManageDepartmentRoster";
import { setSearchFilter } from "../reduxToolkit/slice";
import type { RootState } from "../reduxToolkit/store";
import {
  PREDEFINED_DEPARTMENTS,
  // getDefaultFeatureIdsForDept,
} from "@/lib/departmentRegistry";
import * as LucideIcons from "lucide-react";
import {
  Search,
  FolderPlus,
  Users,
  Loader2,
  Sparkles,
  Building2,
  User,
  Settings2,
  Trash2,
  Plus,
  LayoutGrid,
  Briefcase,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmployeesPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const searchFilter = useSelector(
    (state: RootState) => state.employeeUI.searchFilter,
  );

  const [activeTab, setActiveTab] = useState<
    "employees" | "departments" | "positions"
  >("employees");

  // New Department Form States
  const [selectedPredefinedDeptSlug, setSelectedPredefinedDeptSlug] =
    useState<string>("");

  // Roster Edit Modal State
  const [editingRosterDeptId, setEditingRosterDeptId] = useState<string | null>(
    null,
  );

  // Fetch employees list
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await axios.get("/api/employees");
      return res.data.data || [];
    },
  });

  // Fetch departments list
  const { data: departments, isLoading: deptsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axios.get("/api/departments");
      return res.data.data || [];
    },
  });

  // Fetch dynamic modules list
  const { data: modulesList } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const res = await axios.get("/api/modules");
      return res.data.data || [];
    },
  });

  // Add department mutation
  const addDeptMutation = useMutation({
    mutationFn: async (newDept: {
      slug?: string;
      name: string;
      description: string;
      budget: { annual: number; currency: string };
      headIds: string[];
    }) => {
      const res = await axios.post("/api/departments", newDept);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setSelectedPredefinedDeptSlug("");
      alert("New Department added successfully.");
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to create department.");
    },
  });

  const handleAddDept = () => {
    if (!selectedPredefinedDeptSlug) {
      alert("Please select a predefined department.");
      return;
    }

    addDeptMutation.mutate({
      slug: selectedPredefinedDeptSlug, // Pass slug to trigger auto-provisioning in API
      name: "", // Will be auto-filled by API
      description: "",
      budget: { annual: 150000, currency: "USD" },
      headIds: [], // Assigned later via configurator
    });
  };

  // widgetsList is now replaced by the dynamic modulesList from the API.

  return (
    <div className="space-y-6">
      {/* Header with Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Workforce & Department Directory
          </h1>
          <p className="text-sm text-zinc-550">
            Supervise organization hierarchies, edit leadership structures, and
            enable dynamic dashboard widgets.
          </p>
        </div>

        {activeTab === "employees" && (
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search name, position, dept..."
              value={searchFilter}
              onChange={(e) => dispatch(setSearchFilter(e.target.value))}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100"
            />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("employees")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "employees"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-505 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <Users className="h-4 w-4" />
          Employee Roster
        </button>
        <button
          onClick={() => setActiveTab("departments")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "departments"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-505 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Departments & Leadership
        </button>

        <button
          onClick={() => setActiveTab("positions")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "positions"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-505 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Manage Positions
        </button>
      </div>

      {activeTab === "employees" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
          <div className="lg:col-span-1">
            <AddEmployees />
          </div>
          <div className="lg:col-span-2">
            <ShowEmployess />
          </div>
        </div>
      )}

      {activeTab === "departments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
          {/* Add Department Picker */}
          <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shrink-0">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <FolderPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Add Department
                </h2>
                <p className="text-sm text-zinc-500">
                  Select a predefined organizational unit.
                </p>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-zinc-50/50 dark:bg-zinc-950/50">
              {PREDEFINED_DEPARTMENTS.map((dept) => {
                const isAlreadyAdded = departments?.some(
                  (d: any) => d.slug === dept.slug || d.name === dept.name,
                );
                const isSelected = selectedPredefinedDeptSlug === dept.slug;
                const Icon =
                  (LucideIcons as any)[dept.icon] || LucideIcons.Building;

                return (
                  <div
                    key={dept.slug}
                    onClick={() =>
                      !isAlreadyAdded &&
                      setSelectedPredefinedDeptSlug(dept.slug)
                    }
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                      isAlreadyAdded
                        ? "opacity-60 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 cursor-not-allowed"
                        : isSelected
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm"
                          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 h-fit ${
                        isAlreadyAdded
                          ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                          : isSelected
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {dept.name}
                        </h4>
                        {isAlreadyAdded && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            Added
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {dept.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-end shrink-0">
              <Button
                onClick={handleAddDept}
                disabled={
                  addDeptMutation.isPending || !selectedPredefinedDeptSlug
                }
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full"
              >
                {addDeptMutation.isPending
                  ? "Provisioning..."
                  : "Add Selected Department"}
              </Button>
            </div>
          </div>

          {/* Department List Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Active Divisions
            </h3>

            {deptsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm text-zinc-550">
                  Querying organization charts...
                </p>
              </div>
            ) : departments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map((dept: any) => (
                  <div
                    key={dept._id || dept.id}
                    className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-zinc-955 dark:text-zinc-50 text-base">
                          {dept.name}
                        </h4>
                        {dept.slug && (
                          <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-200/50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                            {dept.slug}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        {dept.description}
                      </p>

                      <button
                        onClick={() =>
                          setEditingRosterDeptId(dept._id || dept.id)
                        }
                        className="mt-4 w-full flex justify-center items-center gap-2 py-1.5 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        Manage Roster & Hierarchy
                      </button>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs mt-3">
                      <div className="flex justify-between items-start font-semibold gap-2">
                        <span className="text-zinc-400 shrink-0">
                          Leadership Heads:
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 text-right leading-relaxed flex-wrap justify-end">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          {dept.headIds && dept.headIds.length > 0
                            ? dept.headIds
                                .map(
                                  (id: string) =>
                                    employees?.find(
                                      (e: any) => e._id === id || e.id === id,
                                    )?.empName,
                                )
                                .filter(Boolean)
                                .join(", ") || "Vacant"
                            : "Vacant"}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-zinc-400">
                          Annual Budget Cap:
                        </span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-mono">
                          ₹{(dept.budget?.annual || 150000).toLocaleString()}
                        </span>
                      </div>

                      {/* Managers and Teams Hierarchy View */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                        <span className="text-zinc-400 shrink-0 block">
                          Managers & Teams:
                        </span>
                        {dept.managers && dept.managers.length > 0 ? (
                          <div className="space-y-2">
                            {dept.managers.map((mgrRow: any, idx: number) => {
                              const manager = employees?.find(
                                (e: any) =>
                                  e._id === mgrRow.managerId ||
                                  e.id === mgrRow.managerId,
                              );
                              return (
                                <div
                                  key={idx}
                                  className="bg-zinc-100/50 dark:bg-zinc-800/20 p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50"
                                >
                                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                    <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                                    {manager
                                      ? manager.empName
                                      : "Vacant / Unknown"}
                                  </div>
                                  {mgrRow.memberIds &&
                                    mgrRow.memberIds.length > 0 && (
                                      <div className="mt-1.5 ml-5 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700 space-y-1">
                                        {mgrRow.memberIds.map(
                                          (memId: string) => {
                                            const member = employees?.find(
                                              (e: any) =>
                                                e._id === memId ||
                                                e.id === memId,
                                            );
                                            return (
                                              <div
                                                key={memId}
                                                className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
                                              >
                                                <ChevronRight className="h-3 w-3" />
                                                {member
                                                  ? member.empName
                                                  : "Unknown Member"}
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic block mt-1">
                            No managers assigned.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                No active departments found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* "Manage Modules" is removed from primary tabs to favor predefined widgets */}

      {activeTab === "positions" && <ManagePositions />}

      {/* Dynamic Modal for Hierarchy/Roster Editing */}
      {editingRosterDeptId && (
        <ManageDepartmentRoster
          departmentId={editingRosterDeptId}
          onClose={() => setEditingRosterDeptId(null)}
        />
      )}
    </div>
  );
}
