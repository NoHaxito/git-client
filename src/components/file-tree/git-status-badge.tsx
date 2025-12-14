import { cn } from "@/lib/utils";

type GitStatus =
  | "modified"
  | "added"
  | "deleted"
  | "renamed"
  | "untracked"
  | "unknown"
  | null;

const STATUS_COLOR_MAP: Record<string, string> = {
  modified: "text-orange-500",
  added: "text-green-500",
  deleted: "text-red-500",
  renamed: "text-blue-500",
  untracked: "text-yellow-500",
};

const STATUS_LETTER_MAP: Record<string, string> = {
  modified: "M",
  added: "A",
  deleted: "D",
  renamed: "R",
  untracked: "U",
};

function getStatusColorHelper(status: GitStatus): string {
  return status
    ? STATUS_COLOR_MAP[status] || "text-muted-foreground"
    : "text-muted-foreground";
}

function getStatusLetter(status: GitStatus): string {
  if (!status) {
    return "";
  }
  return STATUS_LETTER_MAP[status] || "";
}

function getStatusLetterColor(status: GitStatus): string {
  if (!status) {
    return "";
  }
  return STATUS_COLOR_MAP[status] || "";
}

export function GitStatusBadge({ status }: { status: GitStatus }) {
  const letter = getStatusLetter(status);
  const color = getStatusLetterColor(status);

  if (!letter) {
    return null;
  }

  return (
    <span
      className={cn("ml-auto shrink-0 pr-0.5 font-medium text-[10px]", color)}
    >
      {letter}
    </span>
  );
}

export function getStatusColor(status: GitStatus): string {
  return getStatusColorHelper(status);
}
