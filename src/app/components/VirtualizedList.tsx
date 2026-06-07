"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onScrollEnd?: () => void;
  className?: string;
  emptyPlaceholder?: React.ReactNode;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  onScrollEnd,
  className,
  emptyPlaceholder,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(400);

  // Measure container height on mount and resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setClientHeight(el.clientHeight);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setClientHeight(entry.target.clientHeight);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setScrollTop(target.scrollTop);

      if (onScrollEnd) {
        // Trigger onScrollEnd when scrolled to within 200px of the bottom
        const isNearBottom =
          target.scrollTop + target.clientHeight >= target.scrollHeight - 200;
        if (isNearBottom) {
          onScrollEnd();
        }
      }
    },
    [onScrollEnd]
  );

  if (items.length === 0) {
    return emptyPlaceholder || null;
  }

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + clientHeight) / itemHeight) + 2
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      item: items[i],
      index: i,
    });
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={className}
      style={{
        position: "relative",
        overflowY: "auto",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          height: `${totalHeight}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {visibleItems.map(({ item, index }) => (
          <div
            key={`${(item as any)._id ?? ""}-${index}`}
            style={{
              position: "absolute",
              top: `${index * itemHeight}px`,
              left: 0,
              right: 0,
              height: `${itemHeight - 8}px`, // leaving 8px gap
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
