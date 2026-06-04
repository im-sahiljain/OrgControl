"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Sparkles, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnscreenedResumesWidgetProps {
  orgId: string;
}

export default function UnscreenedResumesWidget({ orgId }: UnscreenedResumesWidgetProps) {
  const queryClient = useQueryClient();
  const [screeningId, setScreeningId] = useState<string | null>(null);

  // 1. Fetch all candidates
  const { data: candidates, isLoading } = useQuery({
    queryKey: ["unscreened-candidates", orgId],
    queryFn: async () => {
      const res = await axios.get(`/api/candidates?orgId=${orgId}`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  // Filter for unscreened candidates
  const unscreenedCandidates = candidates?.filter((c: any) => c.isAiScreened === false) || [];

  // 2. Screening Mutation
  const screenMutation = useMutation({
    mutationFn: async (cand: any) => {
      setScreeningId(cand._id);
      
      // Fetch job posting details first to get the job title
      const jobRes = await axios.get(`/api/jobs/${cand.jobId}`);
      const jobTitle = jobRes.data.data?.title || "Software Engineer";

      // A. Call AI parser
      const parseRes = await axios.post("/api/candidates/parse", {
        name: cand.name,
        email: cand.email,
        phone: cand.phone,
        jobTitle,
        resumeUrl: cand.resumeUrl,
      });

      const aiInsights = parseRes.data.data;

      // B. Save updated insights to candidate
      const updateRes = await axios.put("/api/candidates", {
        id: cand._id,
        isAiScreened: true,
        matchScore: aiInsights.matchScore,
        skills: aiInsights.skills,
        summary: aiInsights.summary,
        pros: aiInsights.pros,
        cons: aiInsights.cons,
        interviewQuestions: aiInsights.interviewQuestions,
      });

      return updateRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unscreened-candidates"] });
      queryClient.invalidateQueries({ queryKey: ["recruitment-candidates"] });
      setScreeningId(null);
      alert("AI Screening completed successfully! Candidate advanced to the pipeline.");
    },
    onError: (err: any) => {
      console.error(err);
      alert(err.response?.data?.error || "Failed to parse candidate resume with AI.");
      setScreeningId(null);
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex items-center justify-center space-x-3">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-xs font-bold text-zinc-500">Checking pending resume screening list...</span>
      </div>
    );
  }

  if (unscreenedCandidates.length === 0) {
    return null; // Don't show the widget if there are no unscreened resumes
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-3">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600 animate-pulse" />
            Pending AI Candidate Screening ({unscreenedCandidates.length})
          </h2>
          <p className="text-xs text-zinc-500">
            Resumes submitted through the public portal that are waiting for AI matching evaluation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
        {unscreenedCandidates.map((cand: any) => {
          const isScreeningThis = screeningId === cand._id;
          return (
            <div
              key={cand._id}
              className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl flex items-center justify-between gap-4 text-xs font-semibold"
            >
              <div className="space-y-1 overflow-hidden">
                <span className="font-bold text-zinc-900 dark:text-zinc-50 block truncate">{cand.name}</span>
                <span className="text-[10px] text-zinc-400 block truncate">{cand.email}</span>
                
                {cand.resumeUrl && (
                  <a
                    href={cand.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-650 hover:underline font-bold mt-1"
                  >
                    <FileText className="h-3 w-3" /> View Resume PDF
                  </a>
                )}
              </div>

              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-750 text-white font-bold h-8 text-[10px] px-3 shrink-0 gap-1"
                onClick={() => screenMutation.mutate(cand)}
                disabled={screeningId !== null}
              >
                {isScreeningThis ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Screening...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Screen with AI
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
