"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import { 
  Users, Briefcase, Plus, MapPin, Clock, Calendar, Check, X, ArrowRight,
  ShieldCheck, Loader2, Sparkles, AlertCircle, FileText, ChevronRight, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RootState } from "@/app/reduxToolkit/store";

const PIPELINE_STAGES = [
  { id: "applied", name: "Applied", color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50" },
  { id: "screened", name: "Screened", color: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/50" },
  { id: "interviewing", name: "Interviewing", color: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50" },
  { id: "offered", name: "Offered", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50" },
  { id: "rejected", name: "Rejected", color: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900/50" },
];

export default function RecruitmentPipeline({ feature }: { feature: any }) {
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const orgId = user?.orgId;

  const [activeTab, setActiveTab] = useState<"candidates" | "jobs" | "post-job">("candidates");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Job creation form states
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("Engineering");
  const [jobLoc, setJobLoc] = useState("Remote");
  const [jobType, setJobType] = useState("Full-time");
  const [jobDesc, setJobDesc] = useState("");
  const [jobReqs, setJobReqs] = useState("");

  // 1. Fetch Job Postings
  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ["recruitment-jobs", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const res = await axios.get(`/api/jobs?orgId=${orgId}`);
      return res.data.data || [];
    },
    enabled: !!orgId,
  });

  // Automatically select first job
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  // 2. Fetch Candidates for the selected job
  const { data: candidates, isLoading: loadingCandidates } = useQuery({
    queryKey: ["recruitment-candidates", orgId, selectedJobId],
    queryFn: async () => {
      if (!orgId || !selectedJobId) return [];
      const res = await axios.get(`/api/candidates?orgId=${orgId}&jobId=${selectedJobId}`);
      return res.data.data || [];
    },
    enabled: !!orgId && !!selectedJobId,
  });

  // 3. Create Job Posting Mutation
  const createJobMutation = useMutation({
    mutationFn: async (newJob: any) => {
      const res = await axios.post("/api/jobs", newJob);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-jobs"] });
      // Reset form
      setJobTitle("");
      setJobDesc("");
      setJobReqs("");
      setActiveTab("jobs");
      alert("Job posting successfully created!");
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to create job posting.");
    }
  });

  // 4. Update Candidate Stage Mutation (for Kanban drag/move)
  const updateCandidateStageMutation = useMutation({
    mutationFn: async ({ candidateId, newStage }: { candidateId: string; newStage: string }) => {
      const res = await axios.put("/api/candidates", {
        id: candidateId,
        stage: newStage
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-candidates"] });
      if (selectedCandidate && selectedCandidate._id === data.data._id) {
        setSelectedCandidate(data.data);
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to update candidate pipeline stage.");
    }
  });

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDesc || !jobLoc) {
      alert("Please fill all mandatory fields.");
      return;
    }
    const requirements = jobReqs
      .split("\n")
      .map(r => r.trim())
      .filter(Boolean);

    createJobMutation.mutate({
      orgId,
      title: jobTitle,
      department: jobDept,
      location: jobLoc,
      type: jobType,
      description: jobDesc,
      requirements,
    });
  };

  const handleMoveCandidate = (candidateId: string, targetStage: string) => {
    updateCandidateStageMutation.mutate({ candidateId, newStage: targetStage });
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-55 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            AI Recruitment & Screener Workspace
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Publish open postings, monitor candidate flows, and evaluate automated AI matching details.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800 text-xs font-semibold select-none shrink-0 w-fit">
          <button
            onClick={() => setActiveTab("candidates")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === "candidates" ? "bg-white dark:bg-zinc-850 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"}`}
          >
            <Users className="h-4 w-4" />
            Candidates Board
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === "jobs" ? "bg-white dark:bg-zinc-850 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"}`}
          >
            <Briefcase className="h-4 w-4" />
            Active Postings
          </button>
          <button
            onClick={() => setActiveTab("post-job")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${activeTab === "post-job" ? "bg-white dark:bg-zinc-850 shadow-sm text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"}`}
          >
            <Plus className="h-4 w-4" />
            Create Posting
          </button>
        </div>
      </div>

      {/* Candidates Board View */}
      {activeTab === "candidates" && (
        <div className="space-y-6">
          {/* Job selection dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-400 whitespace-nowrap">Filter by Position:</span>
            {loadingJobs ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
            ) : jobs && jobs.length > 0 ? (
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-xs focus:outline-none font-bold focus:ring-1 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100"
              >
                {jobs.map((job: any) => (
                  <option key={job._id} value={job._id}>
                    {job.title} ({job.location})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-zinc-400 italic">No job postings created yet.</span>
            )}
            
            {selectedJobId && (
              <Link 
                href={`/${orgId}/${selectedJobId}/application`} 
                target="_blank"
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 ml-2"
              >
                Open Public Portal Page <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* Kanban Columns */}
          {loadingCandidates ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              <p className="text-xs text-zinc-400 font-bold">Loading candidate boards...</p>
            </div>
          ) : !selectedJobId ? (
            <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50">
              <Briefcase className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Create a Job Posting First</h4>
              <p className="text-xs text-zinc-450 mt-1 max-w-xs mx-auto">
                Use the "Create Posting" tab above to draft your first open role, then distribute it to candidates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start select-none">
              {PIPELINE_STAGES.map((stage) => {
                const stageCandidates = candidates?.filter((c: any) => c.stage === stage.id) || [];
                return (
                  <div key={stage.id} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850/50 rounded-xl overflow-hidden flex flex-col max-h-[70vh]">
                    <div className={`px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-850 flex justify-between items-center text-xs font-bold ${stage.color}`}>
                      <span>{stage.name}</span>
                      <span className="bg-white/90 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-current text-[10px]">
                        {stageCandidates.length}
                      </span>
                    </div>

                    <div className="p-2 overflow-y-auto space-y-2 flex-1 min-h-[150px]">
                      {stageCandidates.map((cand: any) => (
                        <div
                          key={cand._id}
                          onClick={() => setSelectedCandidate(cand)}
                          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-lg shadow-sm hover:border-blue-500 cursor-pointer transition-all space-y-2 group"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-50 truncate group-hover:text-blue-600 transition-colors">
                              {cand.name}
                            </h4>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                              cand.matchScore >= 85 ? "bg-emerald-50 text-emerald-600" :
                              cand.matchScore >= 75 ? "bg-purple-50 text-purple-600" :
                              "bg-zinc-50 text-zinc-500"
                            }`}>
                              {cand.matchScore}%
                            </span>
                          </div>

                          <p className="text-[10px] text-zinc-400 font-semibold truncate">
                            {cand.email}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {cand.skills?.slice(0, 3).map((sk: string) => (
                              <span key={sk} className="text-[9px] px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded text-zinc-500">
                                {sk}
                              </span>
                            ))}
                            {cand.skills?.length > 3 && (
                              <span className="text-[9px] text-zinc-400 font-bold pl-0.5">+{cand.skills.length - 3}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {stageCandidates.length === 0 && (
                        <div className="text-center py-8 text-[10px] text-zinc-400 italic">
                          No candidates here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active Postings Tab */}
      {activeTab === "jobs" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden text-xs">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-3 border-b border-zinc-150 dark:border-zinc-850 font-bold text-zinc-500 flex justify-between">
            <span className="w-1/3">Job Title / Department</span>
            <span>Location</span>
            <span>Type</span>
            <span>Public Link</span>
            <span className="text-right">Action</span>
          </div>

          {loadingJobs ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>
          ) : jobs && jobs.length > 0 ? (
            jobs.map((job: any) => (
              <div key={job._id} className="p-3.5 bg-white dark:bg-zinc-900 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 last:border-b-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                <div className="w-1/3">
                  <span className="font-bold block text-zinc-800 dark:text-zinc-200 text-sm">{job.title}</span>
                  <span className="text-xxs text-zinc-400 block mt-0.5 font-semibold uppercase tracking-wider">{job.department}</span>
                </div>
                <div className="text-zinc-550 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</div>
                <div className="text-zinc-550 flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.type}</div>
                <div>
                  <Link href={`/${orgId}/${job._id}/application`} target="_blank" className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                    Apply Portal <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xxs font-bold"
                    onClick={() => { setSelectedJobId(job._id); setActiveTab("candidates"); }}
                  >
                    View Pipeline
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-400 italic">No job postings created.</div>
          )}
        </div>
      )}

      {/* Create Job Posting Tab */}
      {activeTab === "post-job" && (
        <form onSubmit={handlePostJob} className="max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-850 pb-3">
            Draft a New Job Posting
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-semibold text-zinc-500">Job Title <span className="text-red-500">*</span></label>
              <Input
                type="text"
                placeholder="Senior Fullstack Developer (Next.js / Node)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">Department</label>
              <select
                value={jobDept}
                onChange={(e) => setJobDept(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100 h-9 font-semibold"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">Job Location <span className="text-red-500">*</span></label>
              <Input
                type="text"
                placeholder="Remote, Mumbai, Bengaluru"
                value={jobLoc}
                onChange={(e) => setJobLoc(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">Employment Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100 h-9 font-semibold"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Job Description <span className="text-red-500">*</span></label>
            <textarea
              placeholder="Provide a description of responsibilities, company mission, and core team stack."
              rows={4}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">Qualifications & Requirements (One per line)</label>
            <textarea
              placeholder="5+ years React production experience&#10;Proficiency in TypeScript type mappings&#10;Familiarity with Mongoose and compound indices"
              rows={3}
              value={jobReqs}
              onChange={(e) => setJobReqs(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-850">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              disabled={createJobMutation.isPending}
            >
              {createJobMutation.isPending ? "Creating Posting..." : "Publish Job Posting"}
            </Button>
          </div>
        </form>
      )}

      {/* Candidate Detail AI Insights Panel */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 w-full max-w-lg flex flex-col h-full overflow-hidden shadow-2xl animate-slide-in">
            {/* Drawer Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20">
              <div className="space-y-1 overflow-hidden">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Candidate Profile</span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-55 truncate">{selectedCandidate.name}</h3>
                <span className="text-xxs text-zinc-400 block font-semibold truncate">{selectedCandidate.email} | {selectedCandidate.phone}</span>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)} 
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* Score & Resume download */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-150 dark:border-zinc-850/80 rounded-xl gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-500/20 flex items-center justify-center font-bold text-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900">
                    {selectedCandidate.matchScore}%
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-100">AI Match Score</h4>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">Scored against job description</span>
                  </div>
                </div>
                
                {selectedCandidate.resumeUrl && (
                  <a href={selectedCandidate.resumeUrl} download={`${selectedCandidate.name.replace(/\s+/g, "_")}_Resume.pdf`}>
                    <Button variant="outline" size="sm" className="h-8 text-xxs font-bold gap-1 flex items-center">
                      <FileText className="h-3.5 w-3.5" /> Download Resume PDF
                    </Button>
                  </a>
                )}
              </div>

              {/* AI Summary */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-600 animate-pulse" />
                  AI Profile Screening Summary
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed bg-violet-50/20 dark:bg-violet-950/10 p-3 rounded-lg border border-violet-100/20">
                  {selectedCandidate.summary || "No AI summary parsed for candidate."}
                </p>
              </div>

              {/* Skills parsed */}
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-850 dark:text-zinc-150">Extracted Skills Inventory</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                    selectedCandidate.skills.map((sk: string) => (
                      <span key={sk} className="px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded font-semibold text-zinc-650">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-400 italic">No skills catalogued.</span>
                  )}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-600 flex items-center gap-1.5"><Check className="h-4 w-4" /> Match Strengths</h4>
                  <ul className="space-y-1.5 text-zinc-505 leading-relaxed pl-1">
                    {selectedCandidate.pros?.map((pro: string, idx: number) => (
                      <li key={idx} className="flex gap-1.5 items-start">
                        <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />
                        {pro}
                      </li>
                    ))}
                    {(!selectedCandidate.pros || selectedCandidate.pros.length === 0) && <li className="italic text-zinc-400">None parsed</li>}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-600 flex items-center gap-1.5"><X className="h-4 w-4" /> Match Gaps</h4>
                  <ul className="space-y-1.5 text-zinc-505 leading-relaxed pl-1">
                    {selectedCandidate.cons?.map((con: string, idx: number) => (
                      <li key={idx} className="flex gap-1.5 items-start">
                        <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-amber-500" />
                        {con}
                      </li>
                    ))}
                    {(!selectedCandidate.cons || selectedCandidate.cons.length === 0) && <li className="italic text-zinc-400">None parsed</li>}
                  </ul>
                </div>
              </div>

              {/* Custom AI Interview Questions */}
              {selectedCandidate.interviewQuestions && selectedCandidate.interviewQuestions.length > 0 && (
                <div className="space-y-3 border-t border-zinc-150 dark:border-zinc-800 pt-6">
                  <h4 className="font-bold text-zinc-850 dark:text-zinc-150 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    AI Interview Questions Guide
                  </h4>
                  <div className="space-y-3">
                    {selectedCandidate.interviewQuestions.map((iq: any, idx: number) => (
                      <div key={idx} className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold mb-1 uppercase tracking-wider">
                          <span>Question {idx + 1}</span>
                          <span className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                            Focus: {iq.focusArea}
                          </span>
                        </div>
                        <p className="font-bold text-zinc-800 dark:text-zinc-250 leading-relaxed">"{iq.question}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Gates */}
            <div className="p-6 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-wrap gap-2 justify-end select-none">
              {selectedCandidate.stage !== "rejected" && (
                <Button 
                  variant="outline" 
                  className="h-8 text-xxs font-bold text-red-600 border-red-200 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/30"
                  onClick={() => handleMoveCandidate(selectedCandidate._id, "rejected")}
                  disabled={updateCandidateStageMutation.isPending}
                >
                  Reject Candidate
                </Button>
              )}
              {selectedCandidate.stage === "applied" && (
                <Button 
                  className="h-8 text-xxs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => handleMoveCandidate(selectedCandidate._id, "screened")}
                  disabled={updateCandidateStageMutation.isPending}
                >
                  Screen Profile
                </Button>
              )}
              {selectedCandidate.stage === "screened" && (
                <Button 
                  className="h-8 text-xxs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => handleMoveCandidate(selectedCandidate._id, "interviewing")}
                  disabled={updateCandidateStageMutation.isPending}
                >
                  Invite to Interview
                </Button>
              )}
              {selectedCandidate.stage === "interviewing" && (
                <Button 
                  className="h-8 text-xxs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleMoveCandidate(selectedCandidate._id, "offered")}
                  disabled={updateCandidateStageMutation.isPending}
                >
                  Extend Job Offer
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
