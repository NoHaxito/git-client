/** biome-ignore-all lint/a11y/noStaticElementInteractions: Minimap needs to be interactive */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: Minimap needs mouse interactions */
"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ThemedToken } from "shiki";

type MinimapProps = {
  code: string;
  highlightedTokens: ThemedToken[][];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  lineHeight?: number;
  width?: number;
};

export function Minimap({
  code,
  highlightedTokens,
  scrollContainerRef,
  lineHeight = 21,
  width = 175,
}: MinimapProps) {
  const minimapRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [totalHeight, setTotalHeight] = useState(0);
  const isDragging = useRef(false);
  const isDraggingIndicator = useRef(false);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  const originalLineHeight = lineHeight;
  const totalLines = Math.max(
    1,
    highlightedTokens.length || code.split("\n").length
  );
  const totalContentHeight = totalLines * originalLineHeight;

  const scale =
    totalContentHeight > 0
      ? Math.min(1, Math.max(0.1, (viewportHeight - 450) / totalContentHeight))
      : 0.1;
  const minimapLineHeight = Math.max(1, originalLineHeight * scale);
  const minimapContentHeight = totalLines * minimapLineHeight;

  const safeViewportHeight = Math.max(1, viewportHeight);
  const safeTotalHeight = Math.max(1, totalHeight);
  const viewportRatio = safeViewportHeight / safeTotalHeight;
  const viewportIndicatorHeight = Math.max(
    10,
    Math.min(minimapContentHeight, minimapContentHeight * viewportRatio)
  );

  const maxScroll = Math.max(0, safeTotalHeight - safeViewportHeight);
  const scrollRatio = maxScroll > 0 ? Math.min(1, scrollTop / maxScroll) : 0;
  const maxIndicatorTop = Math.max(
    0,
    minimapContentHeight - viewportIndicatorHeight
  );
  const viewportIndicatorTop = scrollRatio * maxIndicatorTop;

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const updateDimensions = () => {
      setViewportHeight(container.clientHeight);
      setTotalHeight(container.scrollHeight);
      setScrollTop(container.scrollTop);
    };

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    updateDimensions();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateDimensions);

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateDimensions);
      resizeObserver.disconnect();
    };
  }, [scrollContainerRef]);

  const handleScrollTo = useCallback(
    (targetScrollTop: number) => {
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));
      }
    },
    [maxScroll, scrollContainerRef]
  );

  const handleMinimapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!minimapRef.current) {
        return;
      }

      const rect = minimapRef.current.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const clickRatio = clickY / minimapContentHeight;
      const targetScrollTop = clickRatio * totalHeight - viewportHeight / 2;

      handleScrollTo(targetScrollTop);
    },
    [minimapContentHeight, totalHeight, viewportHeight, handleScrollTo]
  );

  const handleIndicatorMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      isDraggingIndicator.current = true;
      dragStartY.current = e.clientY;
      dragStartScrollTop.current = scrollTop;
    },
    [scrollTop]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const indicator = indicatorRef.current;
      if (indicator?.contains(e.target as Node)) {
        return;
      }
      isDragging.current = true;
      handleMinimapClick(e);
    },
    [handleMinimapClick]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDraggingIndicator.current) {
        const deltaY = e.clientY - dragStartY.current;
        const deltaRatio = deltaY / minimapContentHeight;
        const deltaScroll = deltaRatio * totalHeight;
        const newScrollTop = Math.max(
          0,
          Math.min(dragStartScrollTop.current + deltaScroll, maxScroll)
        );
        handleScrollTo(newScrollTop);
      } else if (isDragging.current) {
        handleMinimapClick(e);
      }
    },
    [
      minimapContentHeight,
      totalHeight,
      maxScroll,
      handleScrollTo,
      handleMinimapClick,
    ]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    isDraggingIndicator.current = false;
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingIndicator.current) {
        const deltaY = e.clientY - dragStartY.current;
        const deltaRatio = deltaY / minimapContentHeight;
        const deltaScroll = deltaRatio * totalHeight;
        const newScrollTop = Math.max(
          0,
          Math.min(dragStartScrollTop.current + deltaScroll, maxScroll)
        );
        handleScrollTo(newScrollTop);
      }
    };

    const handleGlobalMouseUp = () => {
      isDragging.current = false;
      isDraggingIndicator.current = false;
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [minimapContentHeight, totalHeight, maxScroll, handleScrollTo]);

  return (
    <div
      className="sticky top-0 shrink-0 cursor-pointer select-none border-l bg-background dark:bg-zinc-900"
      data-slot="code-minimap"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={minimapRef}
      style={{ width, height: viewportHeight }}
    >
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 overflow-hidden"
        style={{
          height: minimapContentHeight,
        }}
      >
        {highlightedTokens.length > 0
          ? highlightedTokens.map((lineTokens, lineIndex) => (
              <div
                className="truncate whitespace-pre px-0.5"
                key={lineIndex}
                style={{
                  height: minimapLineHeight,
                  fontSize: `${Math.max(1, 8 * scale)}px`,
                  lineHeight: `${minimapLineHeight}px`,
                }}
              >
                {lineTokens.map((token, tokenIndex) => (
                  <span
                    key={tokenIndex}
                    style={{
                      color: token.color,
                      opacity: 0.8,
                    }}
                  >
                    {token.content}
                  </span>
                ))}
              </div>
            ))
          : code.split("\n").map((line, lineIndex) => (
              <div
                className="truncate whitespace-pre px-0.5 text-muted-foreground"
                key={lineIndex}
                style={{
                  height: minimapLineHeight,
                  fontSize: `${Math.max(1, 8 * scale)}px`,
                  lineHeight: `${minimapLineHeight}px`,
                }}
              >
                {line || " "}
              </div>
            ))}
      </div>

      <div
        className="absolute right-0 left-0 cursor-grab bg-accent/50 active:cursor-grabbing active:bg-accent/75"
        onMouseDown={handleIndicatorMouseDown}
        ref={indicatorRef}
        style={{
          top: viewportIndicatorTop,
          height: viewportIndicatorHeight,
        }}
      />
    </div>
  );
}
