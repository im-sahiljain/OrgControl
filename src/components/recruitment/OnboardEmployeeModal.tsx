"use client";

import React, { useState } from "react";
import { X, UserCheck, Building2, Calendar, Mail, Hash, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import toast from "react-hot-toast";

interface OnboardEmployeeModalProps {
  candidate: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export const OnboardEmployeeModal: React.FC<OnboardEmployeeModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const year = new Date().getFullYear();
  const [department, setDepartment] = useState("Engineering");
  const [workEmail, setWorkEmail] = useState(candidate?.email || "");
  const [customEmployeeId, setCustomEmployeeId] = useState(`EMP-${year}-0001`);
  const [initialPassword, setInitialPassword] = useState("Welcome@123");
  const [joiningDate, setJoiningDate] = useState(
    candidate?.offerDetails?.joiningDate || new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch next sequential ID suggestion when modal opens
  React.useEffect(() => {
    if (candidate && isOpen) {
      axios.get(`/api/recruitment/onboard?orgId=${candidate.orgId}`)
        .then((res) => {
          if (res.data?.suggestedId) {
            setCustomEmployeeId(res.data.suggestedId);
          }
        })
        .catch(() => {});
      if (candidate.email) setWorkEmail(candidate.email);
    }
  }, [candidate, isOpen]);

  if (!isOpen || !candidate) return null;

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/recruitment/onboard", {
        candidateId: candidate._id,
        department,
        joiningDate,
        workEmail,
        employeeId: customEmployeeId,
        password: initialPassword,
      });

      if (res.data.success) {
        toast.success(`Successfully onboarded! Employee ID: ${res.data.data.employeeId}`);
        onSuccess(res.data.data);
        onClose();
      } else {
        toast.error(res.data.error || "Onboarding failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to onboard candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-teal-50/50 dark:bg-teal-950/20">
          <div>
            <span className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest block">
              Employee Onboarding Portal
            </span>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
              Convert {candidate.name} to Employee
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleOnboard} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-teal-600" />
                Employee ID (Sequential)
              </label>
              <Input
                required
                placeholder="e.g. EMP-2026-0001"
                value={customEmployeeId}
                onChange={(e) => setCustomEmployeeId(e.target.value)}
                className="h-9 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-600" />
                Work Email (Optional)
              </label>
              <Input
                type="email"
                placeholder="Leave blank or enter work email"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                Assigned Department
              </label>
              <Input
                required
                placeholder="e.g. Engineering, Sales"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                Official Joining Date
              </label>
              <Input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
              Initial Login Password
            </label>
            <Input
              type="text"
              required
              placeholder="Temporary password for employee sign in"
              value={initialPassword}
              onChange={(e) => setInitialPassword(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>

          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-xl space-y-1 text-emerald-800 dark:text-emerald-300">
            <span className="font-bold flex items-center gap-1 text-[11px]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Automated System Actions:
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px] leading-relaxed">
              <li>Assigns custom/sequential Employee ID (`{customEmployeeId}`).</li>
              <li>Creates employee directory record & sets initial password.</li>
              <li>Updates recruitment candidate status to **Hired**.</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-zinc-150 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 text-xs font-bold"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Provisioning Employee...
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" /> Confirm Onboarding
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
