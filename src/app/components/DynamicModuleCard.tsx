import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DynamicModuleCard({ 
  moduleDef, 
  hierarchyLabel, 
  isLead, 
  departmentId, 
  user 
}: { 
  moduleDef: any, 
  hierarchyLabel: string, 
  isLead: boolean,
  departmentId: string,
  user: any
}) {
  const IconComponent = (LucideIcons as any)[moduleDef.icon] || LucideIcons.Layout;
  const queryClient = useQueryClient();
  
  // Local state for the current form inputs
  const [formData, setFormData] = useState<any>({});

  // Fetch entries from database
  const { data: entriesResponse, isLoading } = useQuery({
    queryKey: ["module-entries", moduleDef._id],
    queryFn: async () => {
      const res = await axios.get(`/api/module-entries?moduleId=${moduleDef._id}&orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  const entries = entriesResponse || [];

  // Submit Entry Mutation
  const submitMutation = useMutation({
    mutationFn: async (newEntry: any) => {
      const res = await axios.post("/api/module-entries", {
        moduleId: moduleDef._id,
        departmentId,
        orgId: user?.orgId,
        submittedBy: {
          id: user.id,
          name: user.name
        },
        data: newEntry
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-entries", moduleDef._id] });
      setFormData({});
    },
    onError: (error) => {
      toast.error("Failed to submit entry.");
      console.error(error);
    }
  });

  // Approve Entries Mutation (VP Action)
  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.put("/api/module-entries", {
        moduleId: moduleDef._id,
        orgId: user?.orgId,
        action: "approve_all"
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module-entries", moduleDef._id] });
    },
    onError: (error) => {
      toast.error("Failed to approve entries.");
      console.error(error);
    }
  });

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleSubmit = () => {
    // Validate required fields (just checking if they exist for now)
    const isValid = moduleDef.fields.every((f: any) => formData[f.name]);
    if (!isValid) {
      toast.error("Please fill out all fields.");
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleApproveAll = () => {
    if (confirm("Are you sure you want to approve all pending entries for this module?")) {
      approveMutation.mutate();
    }
  };

  // Map colors to Tailwind classes
  const colorMap: Record<string, { bg: string, text: string, border: string, button: string, badge: string }> = {
    blue: { bg: "bg-blue-50/50", text: "text-blue-600", border: "border-blue-200", button: "bg-blue-600 hover:bg-blue-700", badge: "bg-blue-50 text-blue-600" },
    emerald: { bg: "bg-emerald-50/50", text: "text-emerald-600", border: "border-emerald-200", button: "bg-emerald-600 hover:bg-emerald-700", badge: "bg-emerald-50 text-emerald-600" },
    violet: { bg: "bg-violet-50/50", text: "text-violet-600", border: "border-violet-200", button: "bg-violet-600 hover:bg-violet-700", badge: "bg-violet-50 text-violet-600" },
    amber: { bg: "bg-amber-50/50", text: "text-amber-600", border: "border-amber-200", button: "bg-amber-600 hover:bg-amber-700", badge: "bg-amber-50 text-amber-600" },
    rose: { bg: "bg-rose-50/50", text: "text-rose-600", border: "border-rose-200", button: "bg-rose-600 hover:bg-rose-700", badge: "bg-rose-50 text-rose-600" },
    sky: { bg: "bg-sky-50/50", text: "text-sky-600", border: "border-sky-200", button: "bg-sky-600 hover:bg-sky-700", badge: "bg-sky-50 text-sky-600" },
  };

  const theme = colorMap[moduleDef.color] || colorMap.blue;
  const pendingCount = entries.filter((e: any) => e.status === "pending").length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <h3 className="text-base font-bold flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${theme.text}`} />
          {moduleDef.name}
        </h3>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && isLead && (
            <span className="text-xxs px-2.5 py-1 font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
              {pendingCount} Pending Approval
            </span>
          )}
          <span className={`text-xxs px-2.5 py-1 font-bold rounded-full ${theme.badge}`}>
            Total Entries: {entries.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dynamic Form */}
        <div className={`md:col-span-1 border rounded-xl p-4 space-y-3 ${theme.bg} ${theme.border} dark:bg-zinc-950/30 dark:border-zinc-800`}>
          <h4 className="text-xs font-bold text-zinc-500 mb-2">New Entry Form</h4>
          <div className="space-y-2">
            {moduleDef.fields?.map((field: any, idx: number) => (
              <div key={idx}>
                {field.type === "text" && (
                  <Input
                    placeholder={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="h-8 text-xs bg-white dark:bg-zinc-900"
                    disabled={submitMutation.isPending}
                  />
                )}
                {field.type === "number" && (
                  <Input
                    type="number"
                    placeholder={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="h-8 text-xs bg-white dark:bg-zinc-900"
                    disabled={submitMutation.isPending}
                  />
                )}
                {field.type === "select" && (
                  <Select 
                    value={formData[field.name]} 
                    onValueChange={(val) => handleInputChange(field.name, val)}
                    disabled={submitMutation.isPending}
                  >
                    <SelectTrigger className="w-full h-8 px-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none bg-white dark:bg-zinc-900 font-medium">
                      <SelectValue placeholder={`Select ${field.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt: string, i: number) => (
                        <SelectItem key={i} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
            <Button 
              onClick={handleSubmit} 
              disabled={submitMutation.isPending}
              className={`w-full text-white text-xs h-8 ${theme.button}`}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Entry"}
            </Button>
          </div>
        </div>

        {/* Dynamic Ledger / List Display */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 block">Submitted Entries Ledger</h4>
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
            {isLoading ? (
              <div className="text-xs text-zinc-400 text-center py-8">Loading database records...</div>
            ) : entries.length === 0 ? (
              <div className="text-xs text-zinc-400 text-center py-8 border border-dashed rounded-xl">
                No entries logged yet.
              </div>
            ) : (
              entries.map((entry: any, idx: number) => (
                <div key={idx} className={`flex justify-between items-center p-3 border border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs relative ${entry.status === 'pending' ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-emerald-400'}`}>
                  <div className="space-y-1">
                    {/* Render first field as bold title */}
                    <span className="font-bold block text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      {moduleDef.fields[0] ? entry.data[moduleDef.fields[0].name] : "Entry"}
                      <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-full ${entry.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {entry.status}
                      </span>
                    </span>
                    {/* Render select fields as small tags */}
                    <div className="flex gap-1">
                      {moduleDef.fields.filter((f: any) => f.type === "select").map((f: any, i: number) => (
                        <span key={i} className={`text-xxs font-bold uppercase tracking-wider ${theme.text}`}>
                          {entry.data[f.name]}
                        </span>
                      ))}
                    </div>
                    {/* Submitted by meta */}
                    <span className="text-[10px] text-zinc-400 block mt-1">Logged by: {entry.submittedBy?.name || 'System'}</span>
                  </div>
                  {/* Render number fields on the right */}
                  <div className="text-right">
                    {moduleDef.fields.filter((f: any) => f.type === "number").map((f: any, i: number) => (
                      <span key={i} className="font-mono font-bold block text-zinc-850 dark:text-zinc-100">
                        {entry.data[f.name]}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Leadership Action Mock */}
      {isLead && pendingCount > 0 && (
        <div className={`p-3 rounded-lg border text-xs font-semibold flex justify-between items-center ${theme.bg.replace('/50', '/30')} ${theme.border} ${theme.text}`}>
          <span>VP/Manager Action: Authorize / Review entries for {moduleDef.name}</span>
          <Button 
            onClick={handleApproveAll}
            disabled={approveMutation.isPending}
            className={`${theme.button} text-white text-xxs h-7`}
          >
            {approveMutation.isPending ? "Approving..." : "Approve All Pending"}
          </Button>
        </div>
      )}
    </div>
  );
}
