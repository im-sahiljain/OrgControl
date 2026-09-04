"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";

export default function PublicOfferPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offerData, setOfferData] = useState<any>(null);
  const [isResponding, setIsResponding] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (!token) return;
    async function fetchOffer() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/candidate/offer/${token}`);
        if (res.data.success) {
          setOfferData(res.data.data);
        } else {
          setError(res.data.error || "Failed to load offer details");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
            "This job offer link is invalid or has expired.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchOffer();
  }, [token]);

  const handleDecision = async (action: "accept" | "decline") => {
    if (action === "accept" && !acceptedTerms) {
      toast.error("Please confirm acceptance terms before submitting.");
      return;
    }

    try {
      setIsResponding(true);
      const res = await axios.post(`/api/candidate/offer/${token}`, { action });
      if (res.data.success) {
        toast.success(
          action === "accept"
            ? "Congratulations! You have accepted the job offer."
            : "You have declined the job offer.",
        );
        setOfferData((prev: any) => ({
          ...prev,
          offerStatus: action === "accept" ? "accepted" : "declined",
        }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit decision");
    } finally {
      setIsResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-white">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-zinc-400">
          Verifying secure job offer credentials...
        </p>
      </div>
    );
  }

  if (error || !offerData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="h-14 w-14 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Invalid or Expired Offer
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {error ||
              "We could not locate this offer link. It may have expired or been revoked."}
          </p>
        </div>
      </div>
    );
  }

  const {
    candidateName,
    candidateEmail,
    jobTitle,
    department,
    location,
    offerStatus,
    offerDetails,
  } = offerData;
  const normalizedStatus =
    !offerStatus || offerStatus === "none" ? "pending" : offerStatus;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col justify-between p-4 md:p-8 font-sans">
      <Toaster position="top-center" />

      {/* Top Branding Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-sm">
            OC
          </div>
          <span className="font-extrabold text-base tracking-tight text-zinc-900">
            OrgControl <span className="text-emerald-600">Careers</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xxs font-bold bg-white border border-zinc-200 text-zinc-600 px-3 py-1.5 rounded-full shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure
          Candidate Portal
        </div>
      </header>

      {/* Main Offer Container */}
      <main className="max-w-3xl w-full mx-auto my-8 space-y-6">
        {/* Banner Greeting */}
        <div className="bg-gradient-to-r from-emerald-50 via-white to-white border border-emerald-200 rounded-3xl p-6 md:p-8 space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-600" /> Formal
              Employment Offer
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize border ${
                normalizedStatus === "accepted"
                  ? "bg-teal-100 text-teal-800 border-teal-300"
                  : normalizedStatus === "declined"
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
              }`}
            >
              Status:{" "}
              {normalizedStatus === "pending"
                ? "Pending Response"
                : normalizedStatus}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900">
            Dear {candidateName},
          </h1>
          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
            We are thrilled to extend a formal offer of employment to join our
            team as{" "}
            <strong className="text-emerald-700 font-bold">{jobTitle}</strong>.
            We were immensely impressed by your profile and interview
            evaluations.
          </p>
        </div>

        {/* Offer Terms Breakdown Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-600" /> Summary of Employment
            Package
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1">
              <span className="text-xxs text-zinc-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-blue-600" /> Department &
                Role
              </span>
              <p className="text-sm font-extrabold text-zinc-900">{jobTitle}</p>
              <span className="text-xxs text-zinc-500 block font-medium">
                {department}
              </span>
            </div>

            <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-1">
              <span className="text-xxs text-emerald-700 font-bold uppercase tracking-wider block flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Annual
                Package (INR)
              </span>
              <p className="text-lg font-black text-emerald-700">
                {offerDetails?.salary
                  ? offerDetails.salary.includes("₹")
                    ? offerDetails.salary
                    : `₹ ${offerDetails.salary}`
                  : "As Agreed"}
              </p>
              <span className="text-xxs text-emerald-600/80 block font-medium">
                Annual CTC in ₹
              </span>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1">
              <span className="text-xxs text-zinc-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-amber-600" /> Expected
                Joining Date
              </span>
              <p className="text-sm font-extrabold text-zinc-900">
                {offerDetails?.joiningDate || "Immediate"}
              </p>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1">
              <span className="text-xxs text-zinc-500 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-rose-600" /> Offer Expiry
                Date
              </span>
              <p className="text-sm font-extrabold text-zinc-900">
                {offerDetails?.expiryDate || "Standard 7 Days"}
              </p>
            </div>
          </div>

          {offerDetails?.notes && (
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-1 text-xs">
              <span className="font-bold text-zinc-700 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-violet-600" /> Special
                Instructions & Perks
              </span>
              <p className="text-zinc-600 leading-relaxed">
                {offerDetails.notes}
              </p>
            </div>
          )}

          {/* Interactive Decision Actions */}
          {normalizedStatus === "pending" ? (
            <div className="pt-4 border-t border-zinc-150 space-y-4">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-700 select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  I confirm that I have reviewed the job details, compensation
                  structure, and target joining date outlined in this offer
                  letter.
                </span>
              </label>

              <div className="flex flex-wrap gap-3 justify-end">
                <Button
                  variant="outline"
                  className="h-10 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => handleDecision("decline")}
                  disabled={isResponding}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Decline Offer
                </Button>
                <Button
                  className="h-10 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  onClick={() => handleDecision("accept")}
                  disabled={isResponding || !acceptedTerms}
                >
                  {isResponding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />{" "}
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Accept Job
                      Offer
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-xs space-y-1">
              <span className="font-extrabold text-emerald-700 block">
                Response Recorded: {normalizedStatus.toUpperCase()}
              </span>
              <p className="text-zinc-600">
                {normalizedStatus === "accepted"
                  ? "Thank you for accepting! HR has been notified and will issue your employee portal setup link."
                  : "You have declined this job offer. Thank you for your time."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xxs text-zinc-600 py-4 border-t border-zinc-900">
        © {new Date().getFullYear()} OrgControl Inc. All candidate
        communications are encrypted.
      </footer>
    </div>
  );
}
