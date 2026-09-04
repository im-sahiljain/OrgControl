import React from "react";
import {
  Sparkles,
  Loader2,
  Search,
  FileText,
  EqualApproximately,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RagSearchProps {
  jobs: any[];
  loadingJobs: boolean;
  selectedJobId: string;
  setSelectedJobId: (val: string) => void;
  ragSearchQuery: string;
  setRagSearchQuery: (val: string) => void;
  runRagSearch: (query?: string) => void;
  searchingRag: boolean;
  searchError: string | null;
  searchMethod: string | null;
  ragResults: any[] | null;
  setSelectedCandidateId: (id: string) => void;
  handleUpdateStageFromRag: (id: string, stage: string) => void;
}

export const RagSearch: React.FC<RagSearchProps> = ({
  jobs,
  loadingJobs,
  selectedJobId,
  setSelectedJobId,
  ragSearchQuery,
  setRagSearchQuery,
  runRagSearch,
  searchingRag,
  searchError,
  searchMethod,
  ragResults,
  setSelectedCandidateId,
  handleUpdateStageFromRag,
}) => {
  return (
    <div className="space-y-6">
      {/* Job selection dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-zinc-400">
            Select Job Post:
          </span>
          {loadingJobs ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          ) : jobs && jobs.length > 0 ? (
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-xs focus:outline-none font-bold focus:ring-1 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100 max-w-full">
                <SelectValue placeholder="Select Job" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                className="w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-2rem)]"
              >
                <SelectItem value="all">
                  All Job Postings (Global Pool)
                </SelectItem>
                {(jobs || []).map((job: any) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title} ({job.location})
                    {job.status !== "active" && " (Inactive)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-xs text-zinc-400 italic">
              No job postings created yet.
            </span>
          )}
        </div>
      </div>

      {/* RAG Query Controls */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-violet-600 animate-pulse" />
            Semantic RAG Profile Search
          </h3>
          <p className="text-xxs text-zinc-450 leading-relaxed">
            Describe the specific candidate profile, skills, or background you
            want to find. The Vector Database calculates semantic matching
            values against resume text and coordinates, sorting results by
            score.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" />
            <Input
              placeholder="e.g. Senior Frontend engineer with strong knowledge of state management, Next.js, and Redis caching"
              value={ragSearchQuery}
              onChange={(e) => setRagSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runRagSearch(ragSearchQuery);
              }}
              className="pl-9 h-9 text-xs focus:ring-violet-500 focus:border-violet-500 font-medium"
            />
          </div>
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-750 text-white font-bold h-9 px-4 text-xs shrink-0"
            onClick={() => runRagSearch(ragSearchQuery)}
            disabled={searchingRag || !selectedJobId || ragSearchQuery === ""}
          >
            {searchingRag ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Searching...
              </>
            ) : (
              <>
                <Search className="h-3.5 w-3.5" />
                Search Pool
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs gap-1 flex items-center border-zinc-250 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer disabled:opacity-50"
            onClick={() => {
              setRagSearchQuery("");
              runRagSearch("");
            }}
            disabled={searchingRag || !selectedJobId || selectedJobId === "all"}
            title={
              selectedJobId === "all"
                ? "Select a specific job post to use JD Match"
                : undefined
            }
          >
            {ragSearchQuery === "" && searchingRag ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Matching...
              </>
            ) : (
              <>
                <EqualApproximately className="h-3.5 w-3.5" />
                JD Match
              </>
            )}
          </Button>
        </div>

        {searchMethod && (
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-405 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Search Mode:{" "}
            <span className="text-zinc-550 dark:text-zinc-300 uppercase">
              {searchMethod === "vectorSearch"
                ? "MongoDB Atlas Vector Search"
                : "Local Cosine Similarity Fallback"}
            </span>
          </div>
        )}
      </div>

      {/* Results list */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-zinc-400 block uppercase tracking-wider">
          Matched Candidates ({ragResults?.length || 0})
        </h4>

        {searchingRag ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <span className="text-xs font-bold text-zinc-505">
              Performing semantic vector similarity matches...
            </span>
          </div>
        ) : searchError ? (
          <div className="p-6 text-center text-xs font-bold text-rose-500 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl">
            {searchError}
          </div>
        ) : ragResults && ragResults.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {ragResults.map((cand) => {
              return (
                <div
                  key={cand._id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6"
                >
                  {/* Left: Info */}
                  <div className="space-y-3 flex-1 overflow-hidden">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => setSelectedCandidateId(cand._id)}
                        className="font-bold text-sm text-zinc-900 dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-450 hover:underline text-left truncate cursor-pointer"
                      >
                        {cand.name}
                      </button>

                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded capitalize ${
                          cand.stage === "offered"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : cand.stage === "rejected"
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : cand.stage === "interviewing"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}
                      >
                        {cand.stage}
                      </span>
                    </div>

                    <div className="text-xxs text-zinc-400 space-x-3 font-semibold">
                      <span>{cand.email}</span>
                      <span>•</span>
                      <span>{cand.phone || "No Phone"}</span>
                      {cand.resumeUrl && (
                        <>
                          <span>•</span>
                          <a
                            href={cand.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-bold"
                          >
                            <FileText className="h-3 w-3" /> View Resume
                          </a>
                        </>
                      )}
                    </div>

                    {cand.summary && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {cand.summary}
                      </p>
                    )}

                    {cand.skills && cand.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cand.skills.slice(0, 6).map((sk: string) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded text-[10px] font-bold text-zinc-500"
                          >
                            {sk}
                          </span>
                        ))}
                        {cand.skills.length > 6 && (
                          <span className="text-[9px] text-zinc-400 font-bold self-center">
                            +{cand.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Score & Actions */}
                  <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 shrink-0 min-w-[170px]">
                    <div className="flex items-center gap-3">
                      {/* RAG Vector Similarity Score */}
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">
                          RAG Vector Match
                        </span>
                        <span
                          className={`text-sm font-extrabold block mt-0.5 ${
                            cand.matchPercentage >= 80
                              ? "text-emerald-600 dark:text-emerald-400"
                              : cand.matchPercentage >= 70
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-zinc-500"
                          }`}
                        >
                          {cand.matchPercentage}%
                        </span>
                      </div>

                      {/* Gemini AI Screening Score */}
                      {cand.isAiScreened &&
                      typeof cand.matchScore === "number" ? (
                        <div className="text-right border-l border-zinc-200 dark:border-zinc-800 pl-3">
                          <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">
                            Gemini AI Score
                          </span>
                          <span className="text-sm font-extrabold block mt-0.5 text-blue-600 dark:text-blue-400">
                            {cand.matchScore}%
                          </span>
                        </div>
                      ) : (
                        <div className="text-right border-l border-zinc-200 dark:border-zinc-800 pl-3">
                          <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">
                            Gemini AI Score
                          </span>
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 block mt-1">
                            Pending AI
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {cand.stage !== "interviewing" &&
                        cand.stage !== "offered" && (
                          <Button
                            size="sm"
                            className="h-8 text-[10px] font-bold bg-blue-600 hover:bg-blue-750 text-white"
                            onClick={() =>
                              handleUpdateStageFromRag(cand._id, "interviewing")
                            }
                          >
                            Shortlist
                          </Button>
                        )}
                      {cand.stage !== "rejected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-bold border-zinc-250 text-rose-600 hover:text-rose-700 hover:bg-rose-50/30"
                          onClick={() =>
                            handleUpdateStageFromRag(cand._id, "rejected")
                          }
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-zinc-450 italic text-xs space-y-2 flex flex-col items-center">
            <p>No candidates processed for vector matching yet.</p>
            <p className="text-[10px] font-normal not-italic max-w-sm text-zinc-500">
              Ensure candidate resumes are AI-screened to generate their vector
              embeddings, then enter a search query above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
