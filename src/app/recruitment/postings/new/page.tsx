"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import { Plus } from "lucide-react";
import type { RootState } from "@/app/reduxToolkit/store";
import toast from "react-hot-toast";

import { JobPostingForm } from "@/components/recruitment/JobPostingForm";

export default function CreatePostingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  // Form states
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("Engineering");
  const [jobLoc, setJobLoc] = useState("Remote");
  const [jobType, setJobType] = useState("Full-time");
  const [jobDesc, setJobDesc] = useState("");
  const [jobReqs, setJobReqs] = useState("");

  const createJobMutation = useMutation({
    mutationFn: async (newJobData: any) => {
      const res = await axios.post("/api/jobs", newJobData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Job posting created successfully!");
      queryClient.invalidateQueries({ queryKey: ["recruitment-jobs"] });
      // Reset form
      setJobTitle("");
      setJobDesc("");
      setJobReqs("");
      // Redirect to postings list
      router.push("/recruitment/postings");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to create job posting.");
    },
  });

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.isSandbox) {
      toast.error("Operation not performable in Mock");
      return;
    }
    if (!orgId) {
      toast.error("Missing organization ID");
      return;
    }
    if (!jobTitle.trim() || !jobDesc.trim()) {
      toast.error("Please fill in required fields (Title, Description)");
      return;
    }

    const requirementsArray = jobReqs
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    createJobMutation.mutate({
      orgId,
      title: jobTitle.trim(),
      department: jobDept,
      location: jobLoc,
      type: jobType,
      description: jobDesc.trim(),
      requirements: requirementsArray,
      status: "active",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Plus className="h-6 w-6 text-indigo-600" />
            Create Job Posting
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Publish new opportunities, specify requirements, and configure automated AI resume screening.
          </p>
        </div>
      </div>

      {/* Form Component */}
      <JobPostingForm
        jobTitle={jobTitle}
        setJobTitle={setJobTitle}
        jobDept={jobDept}
        setJobDept={setJobDept}
        jobLoc={jobLoc}
        setJobLoc={setJobLoc}
        jobType={jobType}
        setJobType={setJobType}
        jobDesc={jobDesc}
        setJobDesc={setJobDesc}
        jobReqs={jobReqs}
        setJobReqs={setJobReqs}
        handlePostJob={handlePostJob}
        isPending={createJobMutation.isPending}
      />
    </div>
  );
}
