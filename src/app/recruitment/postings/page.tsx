"use client";

import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import { Briefcase } from "lucide-react";
import type { RootState } from "@/app/reduxToolkit/store";
import toast from "react-hot-toast";

import { JobsTable } from "@/components/recruitment/JobsTable";
import { EditJobModal } from "@/components/recruitment/EditJobModal";
import { ToggleStatusDialog } from "@/components/recruitment/ToggleStatusDialog";

export default function RecruitmentPostingsPage() {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  // Search & Filters
  const [jobSearchInput, setJobSearchInput] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [selectedJobId, setSelectedJobId] = useState<string>("all");

  // Edit Job Modal State
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editJobDept, setEditJobDept] = useState("Engineering");
  const [editJobLoc, setEditJobLoc] = useState("Remote");
  const [editJobType, setEditJobType] = useState("Full-time");
  const [editJobDesc, setEditJobDesc] = useState("");
  const [editJobReqs, setEditJobReqs] = useState("");

  // Toggle Job Status State
  const [togglingJob, setTogglingJob] = useState<any | null>(null);

  // Update Job Mutation
  const updateJobMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await axios.put("/api/jobs", updatedData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Job posting updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["recruitment-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobsPool"] });
      queryClient.invalidateQueries({ queryKey: ["job-candidates"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-all-jobs"] });
      setEditingJob(null);
      setTogglingJob(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update job posting.");
    },
  });

  const handleEditClick = (job: any) => {
    if (user?.isSandbox) {
      toast.error("Operation not performable in Mock");
      return;
    }
    setEditingJob(job);
    setEditJobTitle(job.title || "");
    setEditJobDept(job.department || "Engineering");
    setEditJobLoc(job.location || "Remote");
    setEditJobType(job.type || "Full-time");
    setEditJobDesc(job.description || "");
    const editingRequirements = Array.isArray(job.requirements)
      ? job.requirements
      : typeof job.requirements === "string"
        ? [job.requirements]
        : [];
    setEditJobReqs(editingRequirements.join("\n"));
  };

  const handleToggleStatusClick = (job: any) => {
    if (user?.isSandbox) {
      toast.error("Operation not performable in Mock");
      return;
    }
    setTogglingJob(job);
  };

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

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-emerald-600" />
            Active Job Postings
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage published job openings, track application volumes, and
            configure job details.
          </p>
        </div>
      </div>

      {/* Jobs Table Component */}
      <JobsTable
        jobs={jobs}
        loadingJobs={loadingJobs}
        orgId={orgId || ""}
        searchValue={jobSearchInput}
        onSearchChange={setJobSearchInput}
        statusFilter={jobStatusFilter}
        onStatusChange={setJobStatusFilter}
        typeFilter={jobTypeFilter}
        onTypeChange={setJobTypeFilter}
        onResetFilters={() => {
          setJobSearchInput("");
          setJobStatusFilter("all");
          setJobTypeFilter("all");
        }}
        setSelectedJobId={setSelectedJobId}
        setActiveTab={() => {}}
        handleEditClick={handleEditClick}
        handleToggleStatusClick={handleToggleStatusClick}
      />

      {/* Edit Job Modal */}
      <EditJobModal
        editingJob={editingJob}
        setEditingJob={setEditingJob}
        editJobTitle={editJobTitle}
        setEditJobTitle={setEditJobTitle}
        editJobDept={editJobDept}
        setEditJobDept={setEditJobDept}
        editJobLoc={editJobLoc}
        setEditJobLoc={setEditJobLoc}
        editJobType={editJobType}
        setEditJobType={setEditJobType}
        editJobDesc={editJobDesc}
        setEditJobDesc={setEditJobDesc}
        editJobReqs={editJobReqs}
        setEditJobReqs={setEditJobReqs}
        updateJobMutation={updateJobMutation}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ToggleStatusDialog
        togglingJob={togglingJob}
        setTogglingJob={setTogglingJob}
        updateJobMutation={updateJobMutation}
      />
    </div>
  );
}
