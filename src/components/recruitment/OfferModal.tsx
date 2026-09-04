"use client";

import React, { useState, useEffect } from "react";
import { X, DollarSign, Calendar, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OfferModalProps {
  candidate: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmitOffer: (offerData: {
    salary: string;
    designation: string;
    joiningDate: string;
    expiryDate: string;
    notes: string;
    offerToken?: string;
  }) => void;
  isSubmitting: boolean;
}

export const OfferModal: React.FC<OfferModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onSubmitOffer,
  isSubmitting,
}) => {
  const [salary, setSalary] = useState(candidate?.offerDetails?.salary || "");
  const [designation, setDesignation] = useState("");
  const [joiningDate, setJoiningDate] = useState(candidate?.offerDetails?.joiningDate || "");
  const [expiryDate, setExpiryDate] = useState(candidate?.offerDetails?.expiryDate || "");
  const [notes, setNotes] = useState(candidate?.offerDetails?.notes || "");

  useEffect(() => {
    if (candidate) {
      const initialDesignation =
        candidate.offerDetails?.designation ||
        candidate.jobTitle ||
        candidate.designation ||
        "Senior Software Engineer";
      setDesignation(initialDesignation);
      if (candidate.offerDetails?.salary) setSalary(candidate.offerDetails.salary);
      if (candidate.offerDetails?.joiningDate) setJoiningDate(candidate.offerDetails.joiningDate);
      if (candidate.offerDetails?.expiryDate) setExpiryDate(candidate.offerDetails.expiryDate);
      if (candidate.offerDetails?.notes) setNotes(candidate.offerDetails.notes);
    }
  }, [candidate, isOpen]);

  if (!isOpen || !candidate) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedOfferToken = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

    onSubmitOffer({
      salary,
      designation,
      joiningDate,
      expiryDate,
      notes,
      offerToken: generatedOfferToken,
    });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/30">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">
              Extend Job Offer
            </span>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
              {candidate.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-blue-600" />
              Proposed Designation / Role Title
            </label>
            <Input
              required
              placeholder="e.g. Senior Frontend Developer"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              Offered Annual Package in INR (CTC)
            </label>
            <Input
              required
              placeholder="e.g. ₹ 18,50,000 LPA"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-600" />
                Target Joining Date
              </label>
              <Input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-rose-600" />
                Offer Validity Expiry
              </label>
              <Input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-violet-600" />
              Special Perks & Notes (Optional)
            </label>
            <textarea
              placeholder="e.g. Includes ₹ 2,00,000 sign-on bonus & remote work equipment allowance."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-zinc-150 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? "Extending Offer..." : "Confirm & Issue Job Offer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
