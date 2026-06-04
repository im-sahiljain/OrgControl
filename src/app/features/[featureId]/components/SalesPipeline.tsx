"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DepartmentFeature } from "@/lib/departmentRegistry";
import { Plus, ArrowLeft, Loader2, DollarSign, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/app/reduxToolkit/store";
import { resolveDepartmentRole, getFeatureAccessLevel } from "@/lib/roleResolver";

const STAGES = ["Lead", "Prospect", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function SalesPipeline({ feature }: { feature: DepartmentFeature }) {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);

  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: "",
    clientName: "",
    amount: "",
    stage: "Lead",
    winProbability: "10",
  });

  // Resolve access level for current user
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await axios.get(`/api/departments?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  const userDept = departments?.find((d: any) => d.name === user?.department);
  const roleContext = resolveDepartmentRole(userDept, user?.id || "");
  const accessLevel = getFeatureAccessLevel(feature, roleContext.role);

  const isViewOnly = accessLevel === "view_only" || accessLevel === "none";

  const { data: deals, isLoading } = useQuery({
    queryKey: ["sales_deals"],
    queryFn: async () => {
      const res = await axios.get(`/api/features/sales/deals?orgId=${user?.orgId}`);
      return res.data.data || [];
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post("/api/features/sales/deals", { ...payload, orgId: user?.orgId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_deals"] });
      setIsAddingDeal(false);
      setNewDeal({ title: "", clientName: "", amount: "", stage: "Lead", winProbability: "10" });
    },
  });

  const updateDealStageMutation = useMutation({
    mutationFn: async ({ _id, stage }: { _id: string; stage: string }) => {
      const res = await axios.put("/api/features/sales/deals", { _id, stage, orgId: user?.orgId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_deals"] });
    },
  });

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;
    createDealMutation.mutate({
      ...newDeal,
      amount: Number(newDeal.amount),
      winProbability: Number(newDeal.winProbability),
      assignedTo: user?.id || "mock_sales_user",
    });
  };

  const moveDeal = (dealId: string, currentStage: string, direction: "left" | "right") => {
    if (isViewOnly) return;
    const currentIndex = STAGES.indexOf(currentStage);
    const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < STAGES.length) {
      updateDealStageMutation.mutate({ _id: dealId, stage: STAGES[newIndex] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{feature.name}</h1>
          <p className="text-sm text-zinc-500">{feature.description}</p>
        </div>
        {!isViewOnly && (
          <button
            onClick={() => setIsAddingDeal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
          >
            <Plus className="h-4 w-4" /> New Deal
          </button>
        )}
      </div>

      {isViewOnly && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm font-semibold">
          You have view-only access to this pipeline based on your current role ({roleContext.role}).
        </div>
      )}

      {/* New Deal Modal */}
      {isAddingDeal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md p-6 space-y-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold">Create New Deal</h3>
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Deal Title</label>
                <input required value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" placeholder="e.g. Enterprise License Q3" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1">Client Name</label>
                <input required value={newDeal.clientName} onChange={e => setNewDeal({...newDeal, clientName: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" placeholder="e.g. Acme Corp" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Amount ($)</label>
                  <input required type="number" value={newDeal.amount} onChange={e => setNewDeal({...newDeal, amount: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Win Probability (%)</label>
                  <input required type="number" min="0" max="100" value={newDeal.winProbability} onChange={e => setNewDeal({...newDeal, winProbability: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingDeal(false)} className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={createDealMutation.isPending} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm">{createDealMutation.isPending ? "Saving..." : "Save Deal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {STAGES.map((stage) => {
          const stageDeals = deals?.filter((d: any) => d.stage === stage) || [];
          const stageTotal = stageDeals.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
          
          return (
            <div key={stage} className="min-w-[300px] max-w-[300px] bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col snap-center shrink-0 h-[65vh]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{stage}</h3>
                <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stageDeals.length}
                </span>
              </div>
              
              <div className="text-xs font-semibold text-zinc-500 mb-4 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Total: ${stageTotal.toLocaleString()}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {stageDeals.map((deal: any) => (
                  <div key={deal._id} className="bg-white dark:bg-zinc-950 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 group hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate pr-2">{deal.clientName}</span>
                      <span className="text-xxs font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded">
                        {deal.winProbability}%
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-3">{deal.title}</h4>
                    
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
                        ${deal.amount?.toLocaleString()}
                      </div>
                    </div>

                    {!isViewOnly && (
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => moveDeal(deal._id, deal.stage, "left")}
                          disabled={STAGES.indexOf(stage) === 0}
                          className="px-2 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 rounded disabled:opacity-30"
                        >
                          &larr; Move Left
                        </button>
                        <button 
                          onClick={() => moveDeal(deal._id, deal.stage, "right")}
                          disabled={STAGES.indexOf(stage) === STAGES.length - 1}
                          className="px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"
                        >
                          Move Right &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {stageDeals.length === 0 && (
                  <div className="text-center py-8 text-zinc-400 text-xs border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                    No deals in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
