import React from "react";
import { MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobPostingFormProps {
  jobTitle: string;
  setJobTitle: (val: string) => void;
  jobDept: string;
  setJobDept: (val: string) => void;
  jobLoc: string;
  setJobLoc: (val: string) => void;
  jobType: string;
  setJobType: (val: string) => void;
  jobDesc: string;
  setJobDesc: (val: string) => void;
  jobReqs: string;
  setJobReqs: (val: string) => void;
  handlePostJob: (e: React.FormEvent) => void;
  isPending: boolean;
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({
  jobTitle,
  setJobTitle,
  jobDept,
  setJobDept,
  jobLoc,
  setJobLoc,
  jobType,
  setJobType,
  jobDesc,
  setJobDesc,
  jobReqs,
  setJobReqs,
  handlePostJob,
  isPending,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* Form: Left Column (7 cols) */}
      <form
        onSubmit={handlePostJob}
        className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4"
      >
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-5- border-b border-zinc-100 dark:border-zinc-850 pb-3">
          Draft a New Job Posting
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-500">
              Job Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Senior Fullstack Developer (Next.js / Node)"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">
              Department
            </label>
            <Select value={jobDept} onValueChange={setJobDept}>
              <SelectTrigger className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100 h-9 font-semibold">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]"
              >
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Human Resources">
                  Human Resources
                </SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">
              Job Location <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Remote, Mumbai, Bengaluru"
              value={jobLoc}
              onChange={(e) => setJobLoc(e.target.value)}
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">
              Employment Type
            </label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100 h-9 font-semibold">
                <SelectValue placeholder="Select Employment Type" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]"
              >
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-500">
            Job Description <span className="text-red-500">*</span>
          </label>
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
          <label className="text-xs font-semibold text-zinc-500">
            Qualifications & Requirements (One per line)
          </label>
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
            disabled={isPending}
          >
            {isPending ? "Creating Posting..." : "Publish Job Posting"}
          </Button>
        </div>
      </form>

      {/* Preview: Right Column (5 cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4 lg:sticky lg:top-6">
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Live Public Page Preview
          </h3>
          <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/50">
            Careers Portal Draft
          </span>
        </div>

        <div className="space-y-5 text-xs">
          <div className="space-y-2.5">
            <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100/50 dark:border-blue-900/30 w-fit block">
              {jobDept || "Department"}
            </span>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
              {jobTitle || "Untitled Job Posting (Draft)"}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-zinc-500 font-semibold">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />{" "}
                {jobLoc || "Remote"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />{" "}
                {jobType || "Full-time"}
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2">
            <h3 className="font-bold text-[10px] text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Position Description
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap min-h-[60px]">
              {jobDesc ||
                "Job description details, responsibilities, and team info will display here in real-time."}
            </p>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2">
            <h3 className="font-bold text-[10px] text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Requirements & Qualifications
            </h3>
            {jobReqs.trim() ? (
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-zinc-550 dark:text-zinc-450">
                {jobReqs.split("\n").map(
                  (req, idx) =>
                    req.trim() && (
                      <li key={idx} className="leading-relaxed">
                        {req.trim()}
                      </li>
                    ),
                )}
              </ul>
            ) : (
              <p className="text-xs text-zinc-400 italic">
                Requirements specified in the form will appear as a list here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
