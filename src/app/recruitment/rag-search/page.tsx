"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import { Sparkles } from "lucide-react";
import type { RootState } from "@/app/reduxToolkit/store";
import toast from "react-hot-toast";

import { RagSearch } from "@/components/recruitment/RagSearch";
import { CandidateDetailsDrawer } from "@/components/recruitment/CandidateDetailsDrawer";

export default function RagSearchPage() {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
    null,
  );

  // RAG Search states
  const [ragSearchQuery, setRagSearchQuery] = useState("");
  const [ragResults, setRagResults] = useState<any[] | null>(null);
  const [searchingRag, setSearchingRag] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchMethod, setSearchMethod] = useState<string | null>(null);

  // Cache of RAG search results per Job ID to preserve data on dropdown changes
  const [ragResultsCache, setRagResultsCache] = useState<Record<string, any[]>>(
    {},
  );
  const [ragQueriesCache, setRagQueriesCache] = useState<
    Record<string, string>
  >({});
  const [ragMethodsCache, setRagMethodsCache] = useState<
    Record<string, string>
  >({});

  // Synchronize displayed RAG search data when the selected Job changes
  useEffect(() => {
    if (selectedJobId) {
      setRagResults(ragResultsCache[selectedJobId] || null);
      setRagSearchQuery(ragQueriesCache[selectedJobId] || "");
      setSearchMethod(ragMethodsCache[selectedJobId] || null);
      setSearchError(null);
    } else {
      setRagResults(null);
      setRagSearchQuery("");
      setSearchMethod(null);
      setSearchError(null);
    }
  }, [selectedJobId, ragResultsCache, ragQueriesCache, ragMethodsCache]);

  // Fetch detailed Candidate info on-demand when the drawer opens
  const { data: fullCandidate, isLoading: loadingDetails } = useQuery({
    queryKey: ["candidate-details", orgId, selectedCandidateId],
    queryFn: async () => {
      if (!orgId || !selectedCandidateId) return null;
      const res = await axios.get(
        `/api/candidates?orgId=${orgId}&id=${selectedCandidateId}`,
      );
      return res.data.data;
    },
    enabled: !!orgId && !!selectedCandidateId,
  });

  // Fetch Job Postings
  const { data: jobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ["recruitment-jobs", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await axios.get(`/api/jobs?orgId=${orgId}&all=true`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  const updateCandidateStageMutation = useMutation({
    mutationFn: async ({
      candidateId,
      newStage,
    }: {
      candidateId: string;
      newStage: string;
    }) => {
      const res = await axios.put("/api/candidates", {
        id: candidateId,
        stage: newStage,
      });
      return res.data;
    },
  });

  const handleUpdateStageFromRag = async (
    candidateId: string,
    newStage: string,
  ) => {
    try {
      await updateCandidateStageMutation.mutateAsync({
        candidateId,
        newStage,
      });
      toast.success(`Candidate status updated to ${newStage}`);
      queryClient.invalidateQueries({
        queryKey: ["recruitment-candidates"],
      });
      setRagResults((prev) => {
        if (!prev) return null;
        return prev.map((c) =>
          c._id === candidateId ? { ...c, stage: newStage } : c,
        );
      });
      if (selectedJobId && ragResultsCache[selectedJobId]) {
        setRagResultsCache((prev) => {
          const cached = prev[selectedJobId] || [];
          return {
            ...prev,
            [selectedJobId]: cached.map((c) =>
              c._id === candidateId ? { ...c, stage: newStage } : c,
            ),
          };
        });
      }
    } catch (err) {
      console.error("Failed to update candidate stage from RAG list:", err);
    }
  };

  const runRagSearch = async (query: string = "") => {
    if (!selectedJobId) return;
    setSearchingRag(true);
    setSearchError(null);
    try {
      const res = await axios.post("/api/candidates/match", {
        jobId: selectedJobId,
        searchQuery: query,
        limit: 20,
      });
      if (res.data.success) {
        const results = res.data.data;
        const method = res.data.searchMethod;
        setRagResults(results);
        setSearchMethod(method);

        // Save to cache
        setRagResultsCache((prev) => ({ ...prev, [selectedJobId]: results }));
        setRagQueriesCache((prev) => ({ ...prev, [selectedJobId]: query }));
        setRagMethodsCache((prev) => ({ ...prev, [selectedJobId]: method }));
      } else {
        setSearchError(res.data.error || "Failed to search candidates.");
      }
    } catch (err: any) {
      console.error(err);
      setSearchError(
        err.response?.data?.error || "Error connecting to search service.",
      );
    } finally {
      setSearchingRag(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-600" />
            Semantic RAG Candidate Search
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Search candidate resumes using natural language queries and AI
            vector similarity embeddings.
          </p>
        </div>
      </div>

      {/* RAG Search Component */}
      <RagSearch
        jobs={jobs}
        loadingJobs={loadingJobs}
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
        ragSearchQuery={ragSearchQuery}
        setRagSearchQuery={setRagSearchQuery}
        runRagSearch={runRagSearch}
        searchingRag={searchingRag}
        searchError={searchError}
        searchMethod={searchMethod}
        ragResults={ragResults}
        setSelectedCandidateId={setSelectedCandidateId}
        handleUpdateStageFromRag={handleUpdateStageFromRag}
      />

      {/* Candidate Details Drawer */}
      <CandidateDetailsDrawer
        selectedCandidateId={selectedCandidateId}
        setSelectedCandidateId={setSelectedCandidateId}
        loadingDetails={loadingDetails}
        fullCandidate={fullCandidate}
        updateCandidateStageMutation={updateCandidateStageMutation}
        moveCandidate={() => {}}
      />
    </div>
  );
}
