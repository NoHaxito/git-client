import { useMemo } from "react";
import { createPortal } from "react-dom";
import { DiffLine } from "./diff-viewer/components/diff-line";
import { DiffStats } from "./diff-viewer/components/diff-stats";
import { useDiffHighlighting } from "./diff-viewer/hooks/use-diff-highlighting";
import type { DiffViewerProps } from "./diff-viewer/types";
import { getFileName, parseDiff } from "./diff-viewer/utils";

export function DiffViewer({ filePath, diffContent }: DiffViewerProps) {
  const parsedLines = useMemo(() => parseDiff(diffContent), [diffContent]);
  const fileName = getFileName(filePath);
  const { highlightedLines } = useDiffHighlighting(parsedLines, fileName);

  const diffStats = useMemo(() => {
    const additions = parsedLines.filter(
      (line) => line.type === "added"
    ).length;
    const deletions = parsedLines.filter(
      (line) => line.type === "removed"
    ).length;
    return { additions, deletions };
  }, [parsedLines]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col font-mono text-sm">
        {highlightedLines.map((line, index) => {
          const baseClassName = "py-0.5";
          let lineClassName = "";

          switch (line.type) {
            case "removed":
              lineClassName = "bg-red-500/10 text-red-400";
              break;
            case "added":
              lineClassName = "bg-green-500/10 text-green-400";
              break;
            case "context":
              lineClassName = "text-foreground/70";
              break;
            default:
              lineClassName = "text-foreground/70";
              break;
          }

          return (
            <DiffLine
              baseClassName={baseClassName}
              content={line.content}
              key={index}
              lineClassName={lineClassName}
              lineIndex={index}
              lineType={line.type}
              newLineNumber={line.newLineNumber}
              oldLineNumber={line.oldLineNumber}
              prefix=""
              tokens={line.tokens}
            />
          );
        })}
      </div>
      {createPortal(
        <DiffStats
          additions={diffStats.additions}
          deletions={diffStats.deletions}
        />,
        document.querySelector("[data-diff-details]") ?? document.body
      )}
    </div>
  );
}

export type { DiffViewerProps } from "./diff-viewer/types";
