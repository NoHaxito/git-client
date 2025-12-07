import type { ThemedToken } from "shiki";

export type DiffViewerProps = {
  filePath: string;
  diffContent: string;
};

export type DiffLine = {
  type: "removed" | "added" | "context";
  content: string;
  tokens?: ThemedToken[];
  oldLineNumber?: number;
  newLineNumber?: number;
};

