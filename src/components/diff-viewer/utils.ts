import type { DiffLine } from "./types";

const PATH_SEPARATOR_REGEX = /[/\\]/;
const SPACE_PREFIX_REGEX = /^ /;

export function getFileName(path: string): string {
  const parts = path.split(PATH_SEPARATOR_REGEX);
  return parts.at(-1) || path;
}

export function isHeaderLine(line: string): boolean {
  return (
    line.startsWith("diff --git") ||
    line.startsWith("index ") ||
    line.startsWith("--- ") ||
    line.startsWith("+++ ")
  );
}

export function parseDiff(diff: string): DiffLine[] {
  const lines = diff.split("\n");
  const parsed: DiffLine[] = [];
  let oldLineNumber = 0;
  let newLineNumber = 0;

  for (const line of lines) {
    if (isHeaderLine(line) || line.startsWith("@@")) {
      continue;
    }

    if (line.startsWith("+") && !line.startsWith("+++")) {
      newLineNumber += 1;
      parsed.push({
        type: "added",
        content: line.slice(1),
        newLineNumber,
      });
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      oldLineNumber += 1;
      parsed.push({
        type: "removed",
        content: line.slice(1),
        oldLineNumber,
      });
    } else if (line.startsWith(" ")) {
      oldLineNumber += 1;
      newLineNumber += 1;
      parsed.push({
        type: "context",
        content: line.slice(1),
        oldLineNumber,
        newLineNumber,
      });
    } else {
      oldLineNumber += 1;
      newLineNumber += 1;
      parsed.push({
        type: "context",
        content: line.replace(SPACE_PREFIX_REGEX, ""),
        oldLineNumber,
        newLineNumber,
      });
    }
  }

  return parsed;
}
