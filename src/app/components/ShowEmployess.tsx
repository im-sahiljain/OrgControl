"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Users, Trash2, Eye, Loader2, Sparkles, X, ChevronRight, UserCheck } from "lucide-react";
import type { RootState } from "../reduxToolkit/store";
import { setSelectedEmployee, closeDetailsModal } from "../reduxToolkit/slice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ShowEmployess = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  // Retrieve user permissions and active profile states from Redux
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const userRole = user?.role || "employee";
  const searchFilter = useSelector((state: RootState) => state.employeeUI.searchFilter);
  const selectedEmployee = useSelector((state: RootState) => state.employeeUI.selectedEmployee);
  const isDetailsOpen = useSelector((state: RootState) => state.employeeUI.isDetailsOpen);

  // Promotion local form states
  const [promoPosition, setPromoPosition] = useState<string>("");
  const [promoDept, setPromoDept] = useState<string>("");
  const [promoSalary, setPromoSalary] = useState<string>("");
  const [editingPromo, setEditingPromo] = useState<boolean>(false);

  // Fetch employees list
  const { data: employees, isLoading, isError } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await axios.get(`/api/employees?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  // Fetch departments (for selection dropdown)
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axios.get(`/api/departments?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/employees/${id}`, { data: { orgId: user?.orgId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      dispatch(closeDetailsModal());
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || "Failed to delete employee.");
    },
  });

  // Promote / Reassign mutation using PUT
  const promoteMutation = useMutation({
    mutationFn: async (payload: { id: string; empPosition: string; department: string; salary: number }) => {
      const { id, ...data } = payload;
      const res = await axios.put(`/api/employees/${id}`, { ...data, orgId: user?.orgId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      // Update selected employee details in Redux instantly
      dispatch(setSelectedEmployee(data.data));
      setEditingPromo(false);
      alert("Promotion and reassignment logged successfully in the career lifecycle ledger.");
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to promote employee.");
    },
  });

  const handleOpenPromo = () => {
    if (selectedEmployee) {
      setPromoPosition(selectedEmployee.empPosition);
      setPromoDept(selectedEmployee.department || "Engineering");
      setPromoSalary(String(selectedEmployee.salary || 85000));
      setEditingPromo(true);
    }
  };

  const handleSavePromo = () => {
    if (selectedEmployee && promoPosition && promoSalary) {
      promoteMutation.mutate({
        id: selectedEmployee._id || selectedEmployee.id,
        empPosition: promoPosition,
        department: promoDept,
        salary: Number(promoSalary) || 85000,
      });
    } else {
      alert("Fields cannot be left blank.");
    }
  };

  const filteredEmployees = employees
    ? employees.filter((emp: any) => {
        const term = searchFilter.toLowerCase();
        return (
          emp.empName.toLowerCase().includes(term) ||
          emp.empPosition.toLowerCase().includes(term) ||
          (emp.department && emp.department.toLowerCase().includes(term))
        );
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Directory Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Employee Directory
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Click a row to audit detailed statements, adjust departments, or promote positions.
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400">
            {filteredEmployees.length} Count
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-zinc-500">Querying live data ledger...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-red-500">Failed to load workforce directory.</div>
          ) : filteredEmployees.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp: any) => (
                    <TableRow
                      key={emp._id || emp.id}
                      className="cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                      onClick={() => dispatch(setSelectedEmployee(emp))}
                    >
                      <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                        {emp.profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={emp.profilePhoto}
                            alt={emp.empName}
                            className="h-9 w-9 rounded-full object-cover border border-zinc-200"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold uppercase">
                            {emp.empName.charAt(0)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-zinc-950 dark:text-zinc-50">
                        {emp.empName}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                          {emp.empPosition}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-550 dark:text-zinc-400 text-sm">
                        {emp.department || "Engineering"}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => dispatch(setSelectedEmployee(emp))}
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {userRole === "org_admin" && (
                            <button
                              onClick={() => deleteEmployeeMutation.mutate(emp._id || emp.id)}
                              disabled={deleteEmployeeMutation.isPending}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
              <Users className="h-12 w-12 text-zinc-300 mb-2" />
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                No matching records found
              </h4>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Detailed panel Drawer */}
      {isDetailsOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl p-6 flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-slide-in overflow-y-auto relative">
            <button
              onClick={() => {
                dispatch(closeDetailsModal());
                setEditingPromo(false);
              }}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6 mt-4">
              {selectedEmployee.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedEmployee.profilePhoto}
                  alt={selectedEmployee.empName}
                  className="h-16 w-16 rounded-full object-cover border border-zinc-200 shadow-sm"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xl font-bold uppercase">
                  {selectedEmployee.empName.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-zinc-955 dark:text-zinc-50">
                  {selectedEmployee.empName}
                </h3>
                <p className="text-sm text-zinc-550">{selectedEmployee.empPosition}</p>
              </div>
            </div>

            {/* Editing / Promotion Screen */}
            {editingPromo ? (
              <div className="py-6 space-y-4 text-sm animate-fade-in">
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  Elevate & Reassign Career Lifecycle
                </h4>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Position / Designation</label>
                  <Input
                    type="text"
                    value={promoPosition}
                    onChange={(e) => setPromoPosition(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Department</label>
                  <select
                    value={promoDept}
                    onChange={(e) => setPromoDept(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    {departments?.map((d: any) => (
                      <option key={d._id || d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Monthly Base Salary (₹)</label>
                  <Input
                    type="number"
                    value={promoSalary}
                    onChange={(e) => setPromoSalary(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-4 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setEditingPromo(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePromo}
                    disabled={promoteMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1"
                  >
                    {promoteMutation.isPending ? "Saving..." : "Apply Promotion"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Display Stats View */
              <div className="flex-1 py-6 space-y-6 text-sm">
                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                    Employment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 block mb-1">Age</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                        {selectedEmployee.empAge} Years
                      </span>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs text-zinc-400 block mb-1">Department</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                        {selectedEmployee.department || "Engineering"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                    Payroll & Finance
                  </h4>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-955 rounded-lg border border-zinc-150 dark:border-zinc-800">
                    <span className="text-xs text-zinc-400 block mb-1">Assigned Base Salary</span>
                    <span className="font-bold text-zinc-955 dark:text-zinc-50 text-base">
                      ₹{selectedEmployee.salary?.toLocaleString() || "85,000"} / month
                    </span>
                    <span className="text-xxs text-zinc-450 block mt-1">
                      Annual base: ₹{((selectedEmployee.salary || 85000) * 12).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                    Available Leaves
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 text-center bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100/40">
                      <span className="text-xxs text-blue-500 uppercase font-semibold">Casual</span>
                      <span className="block font-bold text-lg text-blue-750 dark:text-blue-400 mt-0.5">8</span>
                    </div>
                    <div className="p-2 text-center bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100/40">
                      <span className="text-xxs text-emerald-500 uppercase font-semibold">Sick</span>
                      <span className="block font-bold text-lg text-emerald-755 dark:text-emerald-400 mt-0.5">7</span>
                    </div>
                    <div className="p-2 text-center bg-violet-50/50 dark:bg-violet-900/10 rounded-lg border border-violet-100/40">
                      <span className="text-xxs text-violet-500 uppercase font-semibold">Earned</span>
                      <span className="block font-bold text-lg text-violet-755 dark:text-violet-400 mt-0.5">12</span>
                    </div>
                  </div>
                </div>

                {/* Promotion Action Hub (Visible to Org Admin HR only) */}
                {userRole === "org_admin" && (
                  <div className="pt-6 border-t border-zinc-150 dark:border-zinc-800 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                      Administrative Actions
                    </h4>
                    <Button
                      onClick={handleOpenPromo}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-sm py-5 font-semibold"
                    >
                      <UserCheck className="h-4.5 w-4.5" />
                      Promote & Reassign Position
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowEmployess;
