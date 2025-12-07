import { useMemo } from "react";
import { DiffLine } from "./diff-viewer/components/diff-line";
import { useDiffHighlighting } from "./diff-viewer/hooks/use-diff-highlighting";
import type { DiffViewerProps } from "./diff-viewer/types";
import { getFileName, parseDiff } from "./diff-viewer/utils";

export function DiffViewer({ filePath, diffContent }: DiffViewerProps) {
  const parsedLines = useMemo(() => parseDiff(diffContent), [diffContent]);
  const fileName = getFileName(filePath);
  const { highlightedLines } = useDiffHighlighting(parsedLines, fileName);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col font-mono text-sm">
        {highlightedLines.map((line, index) => {
          const baseClassName = "py-0.5";
          let lineClassName = "";
          let prefix = "";

          switch (line.type) {
            case "removed":
              lineClassName = "bg-red-500/10 text-red-400";
              prefix = "-";
              break;
            case "added":
              lineClassName = "bg-green-500/10 text-green-400";
              prefix = "+";
              break;
            case "context":
              lineClassName = "text-foreground/70";
              prefix = " ";
              break;
            default:
              lineClassName = "text-foreground/70";
              prefix = " ";
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
              prefix={prefix}
              tokens={line.tokens}
            />
          );
        })}
      </div>
    </div>
  );
}

export type { DiffViewerProps } from "./diff-viewer/types";
