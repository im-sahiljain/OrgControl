"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Briefcase, Loader2, Plus, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import type { RootState } from "../reduxToolkit/store";
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManagePositions() {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("Unassigned");

  // Fetch departments for the optional association dropdown
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axios.get(`/api/departments?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  // Fetch positions
  const { data: positions, isLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await axios.get(`/api/positions?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  // Create mutation
  const addPositionMutation = useMutation({
    mutationFn: async (payload: any) => {
      return axios.post("/api/positions", { ...payload, orgId: user?.orgId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setTitle("");
      setDescription("");
      setDepartment("Unassigned");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to add position.");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`/api/positions?id=${id}`, { data: { orgId: user?.orgId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });

  const handleAddPosition = () => {
    if (!title.trim()) {
      toast.error("Position title is required.");
      return;
    }
    addPositionMutation.mutate({ title, description, department });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
      {/* Add Position Form */}
      <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Create Position
            </h2>
            <p className="text-xs text-zinc-500">Define formal job roles.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Job Title <span className="text-red-500">*</span></label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Senior Software Engineer" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description (Optional)</label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Short description of the role" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Primary Department</label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100 h-auto min-h-10">
                <SelectValue placeholder="-- Unassigned (Global Role) --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unassigned">-- Unassigned (Global Role) --</SelectItem>
                {departments?.map((d: any) => (
                  <SelectItem key={d._id || d.id} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xxs text-zinc-400 mt-1 flex gap-1 items-start">
              <ShieldAlert className="h-3 w-3 shrink-0" />
              If unassigned, the position can be freely used by any department.
            </p>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 border-t flex justify-end">
          <Button
            onClick={handleAddPosition}
            disabled={addPositionMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex gap-2"
          >
            {addPositionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Position
          </Button>
        </div>
      </div>

      {/* Position List */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm p-6 space-y-4">
        <h3 className="text-base font-bold">Active Organization Roles</h3>
        
        {isLoading ? (
           <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {positions?.map((pos: any) => (
              <div key={pos._id || pos.id} className="p-4 border border-zinc-200 rounded-xl relative group hover:border-blue-300 transition-colors flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-zinc-900">{pos.title}</h4>
                  <div className="flex gap-2 mt-1 mb-2">
                    <span className="text-xxs px-2 py-0.5 bg-blue-50 text-blue-600 rounded uppercase tracking-wider font-bold">
                      {pos.department}
                    </span>
                  </div>
                  {pos.description && (
                    <p className="text-xs text-zinc-500">{pos.description}</p>
                  )}
                </div>
                
                <button 
                  onClick={() => deleteMutation.mutate(pos._id || pos.id)} 
                  disabled={deleteMutation.isPending}
                  className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Position"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {(!positions || positions.length === 0) && (
              <div className="col-span-full text-center p-8 text-sm text-zinc-500 border border-dashed rounded-xl">
                No formal positions defined yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
