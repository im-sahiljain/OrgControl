"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Clock,
  ArrowLeft,
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
});

export default function JobDetailPage() {
  const { companyId, jobId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Progress states
  const [uploading, setUploading] = useState(false);
  const [aiParsing, setAiParsing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch job posting details
  const { data: job, isLoading } = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: async () => {
      const res = await axios.get(`/api/jobs/${jobId}`);
      return res.data.data;
    },
    enabled: !!jobId,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file only.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds the 2MB limit. Please upload a smaller PDF.");
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setErrorMsg("");
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.resumeUrl;
        return copy;
      });
    }
  };

  // Submit, upload to Cloudinary, Parse and Save Candidate details
  const applyMutation = useMutation({
    mutationFn: async () => {
      setAiParsing(true);
      setErrorMsg("");

      if (!selectedFile) {
        throw new Error("No resume file selected.");
      }

      // 1. Upload resume PDF to Cloudinary on submit
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("orgId", job?.orgId);
      formData.append("jobId", job?._id);

      const uploadRes = await axios.post("/api/cloudinary", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = uploadRes.data.url;
      setUploading(false);

      let aiInsights = {
        matchScore: 0,
        skills: [] as string[],
        summary:
          "Pending AI screening. Use the Recruitment Workspace to trigger AI review.",
        pros: [] as string[],
        cons: [] as string[],
        interviewQuestions: [] as any[],
        isAiScreened: false,
      };

      try {
        // 2. Run AI screener parser route
        const parseRes = await axios.post("/api/candidates/parse", {
          name,
          email,
          phone,
          jobTitle: job?.title,
          resumeUrl: uploadedUrl,
        });
        if (parseRes.data.success) {
          aiInsights = {
            ...parseRes.data.data,
            isAiScreened: true,
          };
        }
      } catch (err: any) {
        console.warn(
          "AI screening route failed during submit. Saving candidate as unscreened.",
          err,
        );
      }

      // 3. Save the candidate record in database
      const saveRes = await axios.post("/api/candidates", {
        orgId: job?.orgId,
        jobId: job?._id,
        name,
        email,
        phone,
        resumeUrl: uploadedUrl,
        stage: "applied",
        isAiScreened: aiInsights.isAiScreened,
        matchScore: aiInsights.matchScore,
        skills: aiInsights.skills,
        summary: aiInsights.summary,
        pros: aiInsights.pros,
        cons: aiInsights.cons,
        interviewQuestions: aiInsights.interviewQuestions,
      });
      return saveRes.data;
    },
    onSuccess: () => {
      setAiParsing(false);
      setSubmitted(true);
    },
    onError: (err: any) => {
      console.error(err);
      setErrorMsg(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while analyzing your resume application.",
      );
      setAiParsing(false);
      setUploading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = applicationSchema.safeParse({
      name,
      email,
      phone,
    });
    const fieldErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
    }

    if (!selectedFile) {
      fieldErrors.resumeUrl = "Please upload your resume PDF";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    applyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-zinc-505 font-medium">
          Loading position specifications...
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Position Not Found
        </h3>
        <Link href={`/${companyId}/jobs`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to open roles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 h-16 flex items-center justify-between">
        <Link
          href={`/${companyId}/jobs`}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-100 font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/50">
          Careers Application Portal
        </span>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Job Details Card */}
        <div className="md:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-3">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100/50 dark:border-blue-900/30 w-fit block">
              {job.department}
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-55">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-505">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 shrink-0" /> {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 shrink-0" /> {job.type}
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-6 space-y-4">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Position Description
            </h3>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-4">
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                Requirements & Qualifications
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-500 dark:text-zinc-450">
                {job.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Application Form */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          {submitted ? (
            <div className="text-center py-10 space-y-4 animate-fade-in">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Application Submitted!
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Thank you for applying. Your resume has been uploaded to the
                job's portal. Our HR team will review it and if you align with
                requirements we will get back to you shortly.
              </p>
              <Link href={`/${companyId}/jobs`} className="block pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Back to Jobs Portal
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                Apply for this Position
              </h3>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-lg text-xs flex gap-2 items-center">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Sahil Jain"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.name;
                        return copy;
                      });
                    }
                  }}
                  disabled={aiParsing}
                />
                {errors.name && (
                  <p className="text-xxs text-red-500 font-semibold">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="sahil@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.email;
                        return copy;
                      });
                    }
                  }}
                  disabled={aiParsing}
                />
                {errors.email && (
                  <p className="text-xxs text-red-500 font-semibold">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) {
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.phone;
                        return copy;
                      });
                    }
                  }}
                  disabled={aiParsing}
                />
                {errors.phone && (
                  <p className="text-xxs text-red-500 font-semibold">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Resume File Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500">
                  Resume PDF
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={aiParsing}
                  />

                  {selectedFile ? (
                    <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 truncate">
                          {fileName || "Selected Resume"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFileName("");
                        }}
                        className="text-xxs font-bold text-red-500 hover:text-red-650"
                        disabled={aiParsing}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 border-2 border-dashed ${errors.resumeUrl ? "border-red-500 hover:border-red-600" : "border-zinc-200 dark:border-zinc-800 hover:border-blue-500"} rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs text-zinc-550 bg-zinc-50/20 transition-all w-full`}
                      disabled={uploading || aiParsing}
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      ) : (
                        <Upload className="h-5 w-5 text-zinc-400" />
                      )}
                      <span className="font-bold">
                        {uploading ? "Uploading PDF..." : "Upload Resume PDF"}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Only PDF files are supported.
                      </span>
                    </button>
                  )}
                  {errors.resumeUrl && (
                    <p className="text-xxs text-red-500 font-semibold">
                      {errors.resumeUrl}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-850">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 flex items-center justify-center gap-2 shadow-sm"
                  disabled={uploading || aiParsing || applyMutation.isPending}
                >
                  {aiParsing ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Screening with AI...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
