import React, { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Droppable, DragDropManager } from "@dnd-kit/dom";
import { VirtualizedList } from "@/app/components/VirtualizedList";
import { CandidateCard } from "./CandidateCard";

interface KanbanColumnProps {
  stageId: string;
  stageName: string;
  stageColor: string;
  totalCount: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isDragOver: boolean;
  candidates: any[];
  dndManager: DragDropManager | null;
  selectedIds: Set<string>;
  movingIds: Set<string>;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onCardClick: (cand: any) => void;
  onScrollEnd: () => void;
}

export const KanbanColumn = React.memo(function KanbanColumn({
  stageId,
  stageName,
  stageColor,
  totalCount,
  isLoading,
  isFetchingNextPage,
  isDragOver,
  candidates,
  dndManager,
  selectedIds,
  movingIds,
  onToggleSelect,
  onCardClick,
  onScrollEnd,
}: KanbanColumnProps) {
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = colRef.current;
    if (!el || !dndManager) return;
    const droppable = new Droppable({ id: stageId, element: el }, dndManager);
    return () => droppable.destroy();
  }, [stageId, dndManager]);

  return (
    <div
      ref={colRef}
      className={`bg-zinc-50 dark:bg-zinc-950 border rounded-xl overflow-hidden flex flex-col h-[70vh] w-[280px] md:w-full shrink-0 snap-align-start transition-all duration-150 ${
        isDragOver
          ? "border-blue-400 ring-2 ring-blue-300/40 dark:ring-blue-500/30 scale-[1.01] shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
          : "border-zinc-150 dark:border-zinc-850/50"
      }`}
    >
      <div
        className={`px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-850 flex justify-between items-center text-xs font-bold ${stageColor}`}
      >
        <span>{stageName}</span>
        <span className="bg-white/90 dark:bg-zinc-900 px-2 py-0.5 rounded-full border border-current text-[10px]">
          {totalCount}
        </span>
      </div>

      <div className="p-1 flex-1 min-h-[150px] overflow-hidden flex flex-col">
        <VirtualizedList
          items={candidates}
          itemHeight={104}
          className="flex-1 w-full"
          onScrollEnd={onScrollEnd}
          renderItem={(cand: any) => (
            <CandidateCard
              cand={cand}
              onClick={onCardClick}
              dndManager={dndManager}
              isSelected={selectedIds.has(cand._id)}
              isMoving={movingIds.has(cand._id)}
              onToggleSelect={onToggleSelect}
            />
          )}
          emptyPlaceholder={
            <div className="text-center py-8 text-[10px] text-zinc-400 italic">
              {isLoading ? "Loading..." : "No candidates here"}
            </div>
          }
        />
        {isFetchingNextPage && (
          <div className="py-1.5 flex justify-center text-zinc-400 text-[9px] font-bold gap-1 items-center bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
});
