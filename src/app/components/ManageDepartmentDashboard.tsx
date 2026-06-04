import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import { Check, Loader2, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RootState } from "../reduxToolkit/store";

export default function ManageDepartmentDashboard({ 
  departmentId, 
  onClose 
}: { 
  departmentId: string,
  onClose: () => void 
}) {
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const queryClient = useQueryClient();

  // Fetch all available modules
  const { data: allModules, isLoading: loadingModules } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const res = await axios.get(`/api/modules?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  // Fetch current department to get its data
  const { data: departments, isLoading: loadingDepts } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axios.get(`/api/departments?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  const department = departments?.find((d: any) => d._id === departmentId);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);

  const toggleWidget = (widgetId: string) => {
    setSelectedWidgets(prev => 
      prev.includes(widgetId) ? prev.filter(id => id !== widgetId) : [...prev, widgetId]
    );
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.put("/api/departments", {
        id: departmentId,
        enabledWidgets: selectedWidgets,
        orgId: user?.orgId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      onClose();
    },
    onError: (error) => {
      alert("Failed to update dashboard widgets.");
      console.error(error);
    }
  });

  const handleSave = () => {
    updateMutation.mutate();
  };

  if (loadingModules || loadingDepts) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-violet-600" />
              Configure Department Widgets
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Select which dashboard modules should be visible to {department?.name} employees.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-zinc-50/30 dark:bg-zinc-950/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allModules?.map((mod: any) => {
              const isSelected = selectedWidgets.includes(mod._id);
              return (
                <div 
                  key={mod._id}
                  onClick={() => toggleWidget(mod._id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected 
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10" 
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 h-5 w-5 rounded flex items-center justify-center border ${isSelected ? "bg-violet-600 border-violet-600 text-white" : "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"}`}>
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isSelected ? "text-violet-900 dark:text-violet-100" : "text-zinc-900 dark:text-zinc-100"}`}>
                      {mod.name}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{mod.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button 
            className="bg-violet-600 hover:bg-violet-700 text-white" 
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Dashboard Layout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
