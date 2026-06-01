"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import AddEmployees from "../components/AddEmployees";
import ShowEmployess from "../components/ShowEmployess";
import ManageModules from "../components/ManageModules";
import ManagePositions from "../components/ManagePositions";
import { setSearchFilter } from "../reduxToolkit/slice";
import type { RootState } from "../reduxToolkit/store";
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
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmployeesPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const searchFilter = useSelector((state: RootState) => state.employeeUI.searchFilter);

  const [activeTab, setActiveTab] = useState<"employees" | "departments" | "configurator" | "modules" | "positions">("employees");

  // New Department Form States
  const [deptName, setDeptName] = useState<string>("");
  const [deptDesc, setDeptDesc] = useState<string>("");
  const [deptBudget, setDeptBudget] = useState<string>("150000");
  const [selectedHeadIds, setSelectedHeadIds] = useState<string[]>([]);

  // Configurator Edit States
  const [selectedConfigDeptId, setSelectedConfigDeptId] = useState<string>("");
  const [configHeadIds, setConfigHeadIds] = useState<string[]>([]);
  const [configManagers, setConfigManagers] = useState<{ managerId: string; memberIds: string[] }[]>([]);
  const [configWidgets, setConfigWidgets] = useState<string[]>([]);

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

  // Pre-select first department when configurator loads
  useEffect(() => {
    if (departments && departments.length > 0 && !selectedConfigDeptId) {
      setSelectedConfigDeptId(departments[0]._id || departments[0].id);
    }
  }, [departments]);

  // Load department details when dropdown selection changes
  useEffect(() => {
    if (selectedConfigDeptId && departments) {
      const dept = departments.find(
        (d: any) => d._id === selectedConfigDeptId || d.id === selectedConfigDeptId
      );
      if (dept) {
        setConfigHeadIds(dept.headIds || []);
        setConfigManagers(dept.managers || []);
        setConfigWidgets(dept.enabledWidgets || []);
      }
    }
  }, [selectedConfigDeptId, departments]);

  // Add department mutation
  const addDeptMutation = useMutation({
    mutationFn: async (newDept: { name: string; description: string; budget: { annual: number; currency: string }; headIds: string[] }) => {
      const res = await axios.post("/api/departments", newDept);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setDeptName("");
      setDeptDesc("");
      setSelectedHeadIds([]);
      alert("New Department added successfully.");
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to create department.");
    },
  });

  // Save layout configurator configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (updatedPayload: { id: string; headIds: string[]; managers: any[]; enabledWidgets: string[] }) => {
      const res = await axios.put("/api/departments", updatedPayload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      alert("Department dashboard layout configuration saved successfully.");
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to save configuration.");
    },
  });

  const handleAddDept = () => {
    if (!deptName) {
      alert("Please enter a department name.");
      return;
    }

    addDeptMutation.mutate({
      name: deptName,
      description: deptDesc || `Roster and leadership board active.`,
      budget: { annual: Number(deptBudget) || 150000, currency: "USD" },
      headIds: selectedHeadIds,
    });
  };

  const handleSaveConfig = () => {
    if (!selectedConfigDeptId) {
      alert("Please select a department to configure.");
      return;
    }
    updateConfigMutation.mutate({
      id: selectedConfigDeptId,
      headIds: configHeadIds,
      managers: configManagers,
      enabledWidgets: configWidgets,
    });
  };

  // Manager Row Handlers
  const handleAddManagerRow = () => {
    setConfigManagers([...configManagers, { managerId: "", memberIds: [] }]);
  };

  const handleUpdateManagerId = (index: number, val: string) => {
    const updated = [...configManagers];
    updated[index].managerId = val;
    setConfigManagers(updated);
  };

  const handleToggleMember = (index: number, memberId: string) => {
    const updated = [...configManagers];
    const isChecked = updated[index].memberIds.includes(memberId);
    if (isChecked) {
      updated[index].memberIds = updated[index].memberIds.filter((id) => id !== memberId);
    } else {
      updated[index].memberIds = [...updated[index].memberIds, memberId];
    }
    setConfigManagers(updated);
  };

  const handleDeleteManagerRow = (index: number) => {
    setConfigManagers(configManagers.filter((_, i) => i !== index));
  };

  // Widget Checkbox Handler
  const handleToggleWidget = (widgetId: string) => {
    const isChecked = configWidgets.includes(widgetId);
    if (isChecked) {
      setConfigWidgets(configWidgets.filter((w) => w !== widgetId));
    } else {
      setConfigWidgets([...configWidgets, widgetId]);
    }
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
            Supervise organization hierarchies, edit leadership structures, and enable dynamic dashboard widgets.
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
          onClick={() => setActiveTab("configurator")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "configurator"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-505 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <Settings2 className="h-4 w-4" />
          Dashboard Configurator
        </button>
        <button
          onClick={() => setActiveTab("modules")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "modules"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-505 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Manage Modules
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
          {/* Add Department Form */}
          <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <FolderPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Create Department
                </h2>
                <p className="text-sm text-zinc-500">
                  Establish a new team division.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Department Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Marketing, Sales, Quality"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </label>
                <Input
                  type="text"
                  placeholder="Summary of division goals..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Annual Budget Allocation (INR)
                </label>
                <Input
                  type="number"
                  placeholder="Budget"
                  value={deptBudget}
                  onChange={(e) => setDeptBudget(e.target.value)}
                />
              </div>

              {/* Department Head Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">
                  Assign Leadership heads (Multiple Allowed)
                </label>
                <div className="max-h-40 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 space-y-2 bg-white dark:bg-zinc-950">
                  {employees && employees.length > 0 ? (
                    employees.map((emp: any) => {
                      const empId = emp._id || emp.id;
                      const isChecked = selectedHeadIds.includes(empId);
                      return (
                        <label key={empId} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedHeadIds(selectedHeadIds.filter((id) => id !== empId));
                              } else {
                                setSelectedHeadIds([...selectedHeadIds, empId]);
                              }
                            }}
                            className="h-4 w-4 rounded text-blue-600 border-zinc-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-zinc-750 dark:text-zinc-300 truncate font-medium">
                            {emp.empName} ({emp.empPosition})
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="text-xs text-zinc-400 py-4 text-center">Add employees first.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <Button
                onClick={handleAddDept}
                disabled={addDeptMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {addDeptMutation.isPending ? "Creating..." : "Create Department"}
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
                <p className="text-sm text-zinc-550">Querying organization charts...</p>
              </div>
            ) : departments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map((dept: any) => (
                  <div
                    key={dept._id || dept.id}
                    className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-zinc-955 dark:text-zinc-50 text-base">
                        {dept.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        {dept.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs">
                      <div className="flex justify-between items-start font-semibold gap-2">
                        <span className="text-zinc-400 shrink-0">Leadership Heads:</span>
                        <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 text-right leading-relaxed flex-wrap justify-end">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          {dept.headIds && dept.headIds.length > 0
                            ? dept.headIds
                                .map((id: string) => employees?.find((e: any) => e._id === id || e.id === id)?.empName)
                                .filter(Boolean)
                                .join(", ") || "Vacant"
                            : "Vacant"}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-zinc-400">Annual Budget Cap:</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-mono">
                          ₹{(dept.budget?.annual || 150000).toLocaleString()}
                        </span>
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

      {activeTab === "configurator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
          {/* Settings Left Column - Department & Widgets Selector */}
          <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Target & Widgets
                </h2>
                <p className="text-xs text-zinc-500">
                  Select department and activate features.
                </p>
              </div>
            </div>

            {/* Department Selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Select Department to Configure
              </label>
              <select
                value={selectedConfigDeptId}
                onChange={(e) => setSelectedConfigDeptId(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100"
              >
                {departments?.map((d: any) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialized Widgets Toggles */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Enable Dashboard Modules
              </h4>
              <div className="space-y-3">
                {modulesList && modulesList.length > 0 ? (
                  modulesList.map((w: any) => {
                    const isChecked = configWidgets.includes(w._id || w.id);
                    return (
                      <label
                        key={w._id || w.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-50/20 border-blue-200 dark:border-blue-900/50"
                            : "border-zinc-100 dark:border-zinc-850 bg-white dark:bg-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleWidget(w._id || w.id)}
                          className="mt-1 h-4 w-4 text-blue-600 border-zinc-300 focus:ring-blue-500 rounded cursor-pointer shrink-0"
                        />
                        <div className="space-y-0.5">
                          <span className="text-sm font-semibold block text-zinc-900 dark:text-zinc-100">
                            {w.name}
                          </span>
                          <span className="text-xxs text-zinc-400 font-medium block leading-relaxed">
                            {w.description}
                          </span>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="text-xs text-zinc-500 italic p-4 text-center border rounded-lg bg-zinc-50/50">
                    No modules available. Go to "Manage Modules" to create some!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configurator Right Column - Hierarchy Editor */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                      Roster & Hierarchy Editor
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Link heads, managers, and member trees.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSaveConfig}
                  disabled={updateConfigMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2"
                >
                  {updateConfigMutation.isPending ? "Saving..." : "Save Layout Configuration"}
                </Button>
              </div>

              {/* Department Head Assignment Checkboxes */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Assign Department Head(s)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {employees?.map((emp: any) => {
                    const empId = emp._id || emp.id;
                    const isChecked = configHeadIds.includes(empId);
                    return (
                      <label
                        key={empId}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-xs font-semibold ${
                          isChecked
                            ? "bg-blue-50/20 border-blue-200 text-blue-650"
                            : "border-zinc-100 dark:border-zinc-850 bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setConfigHeadIds(configHeadIds.filter((id) => id !== empId));
                            } else {
                              setConfigHeadIds([...configHeadIds, empId]);
                            }
                          }}
                          className="h-3.5 w-3.5 rounded text-blue-600 border-zinc-350"
                        />
                        <span className="truncate">{emp.empName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Manager Row Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Managers & Sub-Team Allocations
                  </h4>
                  <button
                    onClick={handleAddManagerRow}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-650 hover:text-blue-700 bg-blue-50/50 p-1.5 rounded-lg border border-blue-200/50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Manager Block
                  </button>
                </div>

                {configManagers.length > 0 ? (
                  <div className="space-y-4">
                    {configManagers.map((mgrRow, idx) => (
                      <div
                        key={idx}
                        className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 space-y-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* Manager Selection Dropdown */}
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-400 shrink-0">Manager:</span>
                            <select
                              value={mgrRow.managerId}
                              onChange={(e) => handleUpdateManagerId(idx, e.target.value)}
                              className="flex-1 px-2.5 py-1.5 border border-zinc-250 dark:border-zinc-750 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-zinc-50/50"
                            >
                              <option value="">-- Choose Manager --</option>
                              {employees?.map((emp: any) => (
                                <option key={emp._id || emp.id} value={emp._id || emp.id}>
                                  {emp.empName} ({emp.empPosition})
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={() => handleDeleteManagerRow(idx)}
                            className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg border border-transparent hover:border-red-200/50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Team Member Checklist for this specific manager */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-zinc-400 block">
                            Assign Team Members under this Manager:
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {employees?.map((emp: any) => {
                              const empId = emp._id || emp.id;
                              // Do not allow assigning a manager as a member of their own team
                              if (empId === mgrRow.managerId) return null;

                              const isChecked = mgrRow.memberIds.includes(empId);
                              return (
                                <label
                                  key={empId}
                                  className={`flex items-center gap-2 p-1.5 border rounded-lg cursor-pointer text-xs font-semibold ${
                                    isChecked
                                      ? "bg-violet-50/20 border-violet-200 text-violet-650"
                                      : "border-zinc-100 dark:border-zinc-850 bg-zinc-50/30"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleMember(idx, empId)}
                                    className="h-3.5 w-3.5 rounded text-violet-600 border-zinc-350"
                                  />
                                  <span className="truncate">{emp.empName}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs">
                    No active manager structures configured. Click "Add Manager Block" to visually map a sub-team roster.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 p-3 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-lg border border-indigo-100/30 text-indigo-700 dark:text-indigo-300 text-xs">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Multi-tenant Visual Customizer: Layout changes are isolated under your tenant scope.</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "modules" && (
        <ManageModules />
      )}

      {activeTab === "positions" && (
        <ManagePositions />
      )}
    </div>
  );
}
