"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LayoutGrid, Plus, Trash2, Edit2, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import type { RootState } from "../reduxToolkit/store";

export default function ManageModules() {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Layout");
  const [color, setColor] = useState("blue");
  const [fields, setFields] = useState<{ name: string; type: string; options: string[] }[]>([]);

  // Fetch modules
  const { data: modules, isLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const res = await axios.get(`/api/modules?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  // Create/Update mutation
  const saveModuleMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing) {
        return axios.put("/api/modules", { id: isEditing, ...payload });
      }
      return axios.post("/api/modules", { ...payload, orgId: user?.orgId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      resetForm();
      alert("Module saved successfully!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to save module.");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`/api/modules?id=${id}`, { data: { orgId: user?.orgId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      alert("Module deleted.");
    },
  });

  const resetForm = () => {
    setIsEditing(null);
    setName("");
    setDescription("");
    setIcon("Layout");
    setColor("blue");
    setFields([]);
  };

  const handleEdit = (mod: any) => {
    setIsEditing(mod._id || mod.id);
    setName(mod.name);
    setDescription(mod.description);
    setIcon(mod.icon);
    setColor(mod.color);
    setFields(mod.fields || []);
  };

  const addFieldRow = () => {
    setFields([...fields, { name: "", type: "text", options: [] }]);
  };

  const updateField = (idx: number, key: string, value: any) => {
    const updated = [...fields];
    (updated[idx] as any)[key] = value;
    setFields(updated);
  };

  const removeFieldRow = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name || fields.length === 0) {
      alert("Name and at least one form field are required.");
      return;
    }
    saveModuleMutation.mutate({ name, description, icon, color, fields });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
      {/* Module Creator / Editor Form */}
      <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {isEditing ? "Edit Module" : "Create Module"}
              </h2>
              <p className="text-xs text-zinc-500">Define dynamic forms</p>
            </div>
          </div>
          {isEditing && (
            <button onClick={resetForm} className="text-xs text-blue-600 hover:underline">
              Cancel Edit
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Module Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marketing Tracker" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this track?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Icon Name</label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. TrendingUp" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Theme Color</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-zinc-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="blue">Blue</option>
                <option value="emerald">Emerald</option>
                <option value="violet">Violet</option>
                <option value="amber">Amber</option>
                <option value="rose">Rose</option>
                <option value="sky">Sky</option>
              </select>
            </div>
          </div>

          {/* Dynamic Field Builder */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Form Fields</label>
              <button
                onClick={addFieldRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
              >
                <Plus className="h-3 w-3" /> Add Field
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="text-xs text-zinc-500 italic p-4 bg-zinc-50 rounded-lg text-center border border-dashed border-zinc-200">
                Add fields to build the dynamic form for this module.
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div key={idx} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2 relative">
                    <button
                      onClick={() => removeFieldRow(idx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <div className="pr-6 space-y-2">
                      <Input
                        value={field.name}
                        onChange={(e) => updateField(idx, "name", e.target.value)}
                        placeholder="Field Label (e.g. Deal Amount)"
                        className="h-8 text-xs"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(idx, "type", e.target.value)}
                        className="w-full h-8 px-2 border rounded text-xs bg-white"
                      >
                        <option value="text">Text Input</option>
                        <option value="number">Number Input</option>
                        <option value="select">Dropdown Select</option>
                      </select>
                      
                      {field.type === "select" && (
                        <Input
                          value={field.options.join(", ")}
                          onChange={(e) => updateField(idx, "options", e.target.value.split(",").map(s => s.trim()))}
                          placeholder="Options (comma separated)"
                          className="h-8 text-xs bg-white"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-zinc-50 border-t flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saveModuleMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex gap-2"
          >
            {saveModuleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEditing ? "Update Module" : "Create Module"}
          </Button>
        </div>
      </div>

      {/* Module List Grid */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold">Active Dashboard Modules</h3>
        
        {isLoading ? (
           <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules?.map((mod: any) => (
              <div key={mod._id || mod.id} className="p-4 border border-zinc-200 rounded-xl relative group hover:border-blue-300 transition-colors">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                  <button onClick={() => handleEdit(mod)} className="text-blue-600 p-1 hover:bg-blue-50 rounded">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(mod._id || mod.id)} className="text-red-600 p-1 hover:bg-red-50 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <h4 className="font-bold text-zinc-900">{mod.name}</h4>
                <p className="text-xs text-zinc-500 mt-1">{mod.description}</p>
                
                <div className="mt-4 pt-3 border-t border-zinc-100">
                  <span className="text-xxs font-bold text-zinc-400 block mb-2">DYNAMIC FIELDS ({mod.fields?.length || 0})</span>
                  <div className="flex flex-wrap gap-2">
                    {mod.fields?.map((f: any, i: number) => (
                      <span key={i} className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xxs font-mono rounded border">
                        {f.name} [{f.type}]
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
