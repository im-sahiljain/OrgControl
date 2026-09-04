import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToggleStatusDialogProps {
  togglingJob: any | null;
  setTogglingJob: (job: any | null) => void;
  updateJobMutation: any;
}

export const ToggleStatusDialog: React.FC<ToggleStatusDialogProps> = ({
  togglingJob,
  setTogglingJob,
  updateJobMutation,
}) => {
  if (!togglingJob) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm flex flex-col overflow-hidden shadow-2xl p-6 space-y-4"
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-55">
            Confirm Status Change
          </h3>
          <button
            onClick={() => setTogglingJob(null)}
            className="p-1 hover:bg-zinc-150 dark:hover:bg-zinc-800 rounded-full text-zinc-505 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Are you sure you want to {togglingJob.status === "active" ? "deactivate" : "activate"} the job posting for{" "}
          <strong className="text-zinc-900 dark:text-zinc-105">"{togglingJob.title}"</strong>?
          {togglingJob.status === "active"
            ? " Deactivating this role will hide it from the public careers page, preventing new candidate applications."
            : " Activating this role will make it visible on the public careers page, allowing new candidate applications."}
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setTogglingJob(null)}
            className="font-bold h-8 text-xs"
          >
            No
          </Button>
          <Button
            onClick={() => {
              const newStatus = togglingJob.status === "active" ? "inactive" : "active";
              updateJobMutation.mutate({
                jobId: togglingJob._id,
                updatedFields: { status: newStatus },
              });
              setTogglingJob(null);
            }}
            className={`text-white font-bold h-8 text-xs cursor-pointer ${
              togglingJob.status === "active"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
            disabled={updateJobMutation.isPending}
          >
            Yes
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
