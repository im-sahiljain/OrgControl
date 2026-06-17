import React, { useRef, useEffect } from "react";
import { Loader2, GripVertical, Check } from "lucide-react";
import { Draggable, DragDropManager } from "@dnd-kit/dom";

interface CandidateCardProps {
  cand: any;
  onClick: (cand: any) => void;
  dndManager: DragDropManager | null;
  isSelected: boolean;
  isMoving: boolean;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
}

export const CandidateCard = React.memo(
  ({
    cand,
    onClick,
    dndManager,
    isSelected,
    isMoving,
    onToggleSelect,
  }: CandidateCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const el = cardRef.current;
      if (!el || !dndManager) return;
      const draggable = new Draggable(
        { id: cand._id, element: el },
        dndManager,
      );
      return () => draggable.destroy();
    }, [cand._id, dndManager]);

    return (
      <div
        ref={cardRef}
        className={`relative p-3 h-24 bg-white dark:bg-zinc-900 border rounded-lg shadow-sm transition-all space-y-2 group overflow-hidden select-none ${
          isSelected
            ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800/50 cursor-grab"
            : "border-zinc-150 dark:border-zinc-850 hover:border-blue-400 cursor-grab"
        }`}
        style={{ boxSizing: "border-box" }}
      >
        {isMoving && (
          <div className="absolute inset-0 z-30 rounded-lg bg-white/75 dark:bg-zinc-900/75 backdrop-blur-[2px] flex items-center justify-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            <span className="text-[10px] font-semibold text-blue-600">
              Moving…
            </span>
          </div>
        )}

        <div
          className={`absolute top-1.5 left-1.5 z-10 transition-opacity duration-150 ${
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(cand._id, e);
          }}
        >
          <div
            className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
              isSelected
                ? "bg-blue-600 border-blue-600"
                : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-600 hover:border-blue-400"
            }`}
          >
            {isSelected && (
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            )}
          </div>
        </div>

        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-40 transition-opacity">
          <GripVertical className="h-3.5 w-3.5 text-zinc-400" />
        </div>

        <div className="flex justify-between items-start gap-1 pl-5">
          <div className="flex items-center gap-1">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-50 truncate group-hover:text-blue-600 transition-colors">
              {cand.name}
            </h4>
            <button
              onClick={() => onClick(cand)}
              className="h-4 w-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-[8px] font-bold hover:cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors shrink-0"
            >
              i
            </button>
          </div>
          <span
            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded mr-4 ${
              cand.matchScore >= 85
                ? "bg-emerald-50 text-emerald-600"
                : cand.matchScore >= 75
                  ? "bg-purple-50 text-purple-600"
                  : "bg-zinc-50 text-zinc-500"
            }`}
          >
            {cand.matchScore}%
          </span>
        </div>

        <p className="text-[10px] text-zinc-400 font-semibold truncate pl-5">
          {cand.email}
        </p>

        <div className="flex gap-1 pl-5 items-center overflow-hidden">
          {cand.skills?.slice(0, 3).map((sk: string) => (
            <span
              key={sk}
              className="text-[9px] px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded text-zinc-505 shrink-0"
            >
              {sk}
            </span>
          ))}
          {cand.skills && cand.skills.length > 3 && (
            <span className="text-[9px] text-zinc-400 font-bold shrink-0">
              +{cand.skills.length - 3}
            </span>
          )}
        </div>
      </div>
    );
  },
);

CandidateCard.displayName = "CandidateCard";
