import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { User, UserCheck, Plus, Trash2, ChevronRight, Settings2, X } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../reduxToolkit/store";

interface ManageDepartmentRosterProps {
  departmentId: string;
  onClose: () => void;
}

export default function ManageDepartmentRoster({ departmentId, onClose }: ManageDepartmentRosterProps) {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);

  const [configHeadIds, setConfigHeadIds] = useState<string[]>([]);
  const [configManagers, setConfigManagers] = useState<{ managerId: string; memberIds: string[] }[]>([]);

  // Fetch employees list
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await axios.get(`/api/employees?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  // Fetch departments to get initial state
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axios.get(`/api/departments?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  useEffect(() => {
    if (departmentId && departments) {
      const dept = departments.find((d: any) => d._id === departmentId || d.id === departmentId);
      if (dept) {
        setConfigHeadIds(dept.headIds || []);
        setConfigManagers(dept.managers || []);
      }
    }
  }, [departmentId, departments]);

  const updateConfigMutation = useMutation({
    mutationFn: async (updatedPayload: { id: string; headIds: string[]; managers: any[] }) => {
      const res = await axios.put("/api/departments", { ...updatedPayload, orgId: user?.orgId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      alert("Roster configuration saved successfully.");
      onClose();
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to save configuration.");
    },
  });

  const handleSave = () => {
    updateConfigMutation.mutate({
      id: departmentId,
      headIds: configHeadIds,
      managers: configManagers,
    });
  };

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

  const dept = departments?.find((d: any) => d._id === departmentId || d.id === departmentId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-blue-600" />
              Manage Hierarchy: {dept?.name}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Assign department heads, managers, and map their teams.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Department Head Assignment */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Assign Department Head(s)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {employees?.map((emp: any) => {
                const empId = emp._id || emp.id;
                const isChecked = configHeadIds.includes(empId);
                return (
                  <label key={empId} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-xs font-semibold ${
                    isChecked ? "bg-blue-50/20 border-blue-200 text-blue-650" : "border-zinc-100 dark:border-zinc-850 bg-white"
                  }`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => setConfigHeadIds(isChecked ? configHeadIds.filter(id => id !== empId) : [...configHeadIds, empId])}
                      className="h-3.5 w-3.5 rounded text-blue-600"
                    />
                    <span className="truncate">{emp.empName}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />

          {/* Dynamic Manager Row Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Managers & Sub-Team Allocations</h4>
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
                  <div key={idx} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-500">Manager:</span>
                        <select
                          value={mgrRow.managerId}
                          onChange={(e) => handleUpdateManagerId(idx, e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border border-zinc-250 dark:border-zinc-750 rounded-lg text-xs bg-white focus:outline-none"
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
                        className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg border border-transparent hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-zinc-400">Team Members:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {employees?.map((emp: any) => {
                          const empId = emp._id || emp.id;
                          if (empId === mgrRow.managerId) return null;
                          const isChecked = mgrRow.memberIds.includes(empId);
                          return (
                            <label key={empId} className={`flex items-center gap-2 p-1.5 border rounded-lg cursor-pointer text-xs font-semibold ${
                              isChecked ? "bg-violet-50/20 border-violet-200 text-violet-650" : "bg-white border-zinc-100"
                            }`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleMember(idx, empId)}
                                className="h-3.5 w-3.5 rounded text-violet-600"
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
              <div className="text-center py-8 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">
                No manager structures configured. Click "Add Manager Block".
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateConfigMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm"
          >
            {updateConfigMutation.isPending ? "Saving..." : "Save Hierarchy"}
          </button>
        </div>
      </div>
    </div>
  );
}
