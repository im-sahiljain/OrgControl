import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

interface EditJobModalProps {
  editingJob: any | null;
  setEditingJob: (job: any | null) => void;
  editJobTitle: string;
  setEditJobTitle: (val: string) => void;
  editJobDept: string;
  setEditJobDept: (val: string) => void;
  editJobLoc: string;
  setEditJobLoc: (val: string) => void;
  editJobType: string;
  setEditJobType: (val: string) => void;
  editJobDesc: string;
  setEditJobDesc: (val: string) => void;
  editJobReqs: string;
  setEditJobReqs: (val: string) => void;
  updateJobMutation: any;
}

const departmentOptions = [
  "Engineering",
  "Human Resources",
  "Sales",
  "Finance",
];

const employmentTypes = ["Full-time", "Part-time", "Contract", "Internship"];

export const EditJobModal: React.FC<EditJobModalProps> = ({
  editingJob,
  setEditingJob,
  editJobTitle,
  setEditJobTitle,
  editJobDept,
  setEditJobDept,
  editJobLoc,
  setEditJobLoc,
  editJobType,
  setEditJobType,
  editJobDesc,
  setEditJobDesc,
  editJobReqs,
  setEditJobReqs,
  updateJobMutation,
}) => {
  if (!editingJob) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl p-6 space-y-4"
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Edit Job Posting
          </h3>
          <button
            onClick={() => setEditingJob(null)}
            className="p-1 hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-full text-zinc-505 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">
              Job Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Senior Developer"
              value={editJobTitle}
              onChange={(e) => setEditJobTitle(e.target.value)}
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">
                Department
              </label>
              <Select value={editJobDept} onValueChange={setEditJobDept}>
                <SelectTrigger className="w-full h-9 font-semibold text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {[
                    ...(editJobDept && !departmentOptions.includes(editJobDept)
                      ? [editJobDept]
                      : []),
                    ...departmentOptions,
                  ].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500">
                Employment Type
              </label>
              <Select value={editJobType} onValueChange={setEditJobType}>
                <SelectTrigger className="w-full h-9 font-semibold text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <SelectValue placeholder="Select Employment Type" />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {[
                    ...(editJobType && !employmentTypes.includes(editJobType)
                      ? [editJobType]
                      : []),
                    ...employmentTypes,
                  ].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">
              Job Location <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Remote"
              value={editJobLoc}
              onChange={(e) => setEditJobLoc(e.target.value)}
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Job description..."
              rows={4}
              value={editJobDesc}
              onChange={(e) => setEditJobDesc(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus-visible:ring-inset text-zinc-800 dark:text-zinc-100"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500">
              Qualifications & Requirements (One per line)
            </label>
            <textarea
              placeholder="Qualifications..."
              rows={3}
              value={editJobReqs}
              onChange={(e) => setEditJobReqs(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus-visible:ring-inset text-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            variant="outline"
            onClick={() => setEditingJob(null)}
            className="font-bold h-9 text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!editJobTitle || !editJobDesc || !editJobLoc) {
                toast.error("Please fill all mandatory fields.");
                return;
              }
              const requirements = editJobReqs
                .split("\n")
                .map((r) => r.trim())
                .filter(Boolean);

              updateJobMutation.mutate({
                jobId: editingJob._id,
                updatedFields: {
                  title: editJobTitle,
                  department: editJobDept,
                  location: editJobLoc,
                  type: editJobType,
                  description: editJobDesc,
                  requirements,
                },
              });
              setEditingJob(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 text-xs cursor-pointer"
            disabled={updateJobMutation.isPending}
          >
            {updateJobMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
