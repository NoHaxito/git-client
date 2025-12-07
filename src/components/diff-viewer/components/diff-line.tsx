import type { ThemedToken } from "shiki";
import { cn } from "@/lib/utils";
import { Token } from "../../code-editor/components/token";

type DiffLineProps = {
  baseClassName: string;
  lineClassName: string;
  prefix: string;
  content: string;
  tokens?: ThemedToken[];
  lineIndex: number;
  oldLineNumber?: number;
  newLineNumber?: number;
  lineType: "removed" | "added" | "context";
};

export function DiffLine({
  baseClassName,
  lineClassName,
  prefix,
  content,
  tokens,
  lineIndex,
  oldLineNumber,
  newLineNumber,
  lineType,
}: DiffLineProps) {
  let oldLineTextColor = "text-muted-foreground/60";
  let newLineTextColor = "text-muted-foreground/60";

  if (lineType === "removed") {
    oldLineTextColor = "text-red-400/80";
  } else if (lineType === "added") {
    newLineTextColor = "text-green-400/80";
  }

  return (
    <div className={cn(baseClassName, lineClassName, "flex items-start gap-0")}>
      <span
        className={cn(
          oldLineTextColor,
          "w-12 select-none px-2 text-right tabular-nums"
        )}
      >
        {oldLineNumber ?? ""}
      </span>
      <span
        className={cn(
          newLineTextColor,
          "w-12 select-none px-2 text-right tabular-nums"
        )}
      >
        {newLineNumber ?? ""}
      </span>
      <span className="select-none px-2 text-muted-foreground/50">
        {prefix}
      </span>
      <span className="wrap-break-word flex-1 whitespace-pre-wrap px-2">
        {tokens && tokens.length > 0
          ? tokens.map((token, tokenIndex) => (
              <Token
                key={`token-${tokenIndex}`}
                lineIndex={lineIndex}
                token={token}
                tokenIndex={tokenIndex}
              />
            ))
          : content || " "}
      </span>
    </div>
  );
}
