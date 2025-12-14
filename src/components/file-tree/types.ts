export type GitStatus =
  | "modified"
  | "added"
  | "deleted"
  | "renamed"
  | "untracked"
  | "unknown"
  | null;

export type DirectoryEntry = {
  name: string;
  path: string;
  is_dir: boolean;
};

export type FileTreeNode = DirectoryEntry & {
  children?: FileTreeNode[];
  expanded?: boolean;
  gitStatus?: GitStatus;
  isIgnored?: boolean;
};
