import { useMemo } from "react";
import { useNavigate } from "react-router";
import { getFileIcon } from "@/components/file-tree/file-icon";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useGitStatus } from "@/hooks/tauri-queries";
import { useRepoStore } from "@/stores/repo";

type GitStatus =
  | "modified"
  | "added"
  | "deleted"
  | "renamed"
  | "untracked"
  | "modified-staged"
  | "added-modified"
  | "added-deleted"
  | "unknown";

function getStatusColor(status: GitStatus): string {
  switch (status) {
    case "added":
    case "added-modified":
      return "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400";
    case "modified":
    case "modified-staged":
      return "border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400";
    case "deleted":
    case "added-deleted":
      return "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400";
    case "renamed":
      return "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "untracked":
      return "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    default:
      return "border-muted-foreground/50 bg-muted text-muted-foreground";
  }
}

function getStatusBadge(status: GitStatus): string {
  switch (status) {
    case "added":
    case "added-modified":
      return "A";
    case "modified":
    case "modified-staged":
      return "M";
    case "deleted":
    case "added-deleted":
      return "D";
    case "renamed":
      return "R";
    case "untracked":
      return "U";
    default:
      return "?";
  }
}

function getStatusLabel(status: GitStatus): string {
  switch (status) {
    case "added":
      return "Added";
    case "modified":
      return "Modified";
    case "deleted":
      return "Deleted";
    case "renamed":
      return "Renamed";
    case "untracked":
      return "Untracked";
    case "modified-staged":
      return "Modified (Staged)";
    case "added-modified":
      return "Added & Modified";
    case "added-deleted":
      return "Added & Deleted";
    default:
      return "Unknown";
  }
}

type GroupedChanges = {
  [key in GitStatus]?: string[];
};

export default function ProjectChanges() {
  const navigate = useNavigate();
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const { data: gitStatus = {}, isLoading } = useGitStatus(currentRepo);

  const groupedChanges = useMemo<GroupedChanges>(() => {
    const groups: GroupedChanges = {};

    for (const [filePath, status] of Object.entries(gitStatus)) {
      const gitStatus = status as GitStatus;
      if (!groups[gitStatus]) {
        groups[gitStatus] = [];
      }
      groups[gitStatus]!.push(filePath);
    }

    for (const status in groups) {
      groups[status as GitStatus]?.sort();
    }

    return groups;
  }, [gitStatus]);

  const totalChanges = Object.keys(gitStatus).length;
  const statusOrder: GitStatus[] = [
    "added",
    "modified",
    "modified-staged",
    "deleted",
    "renamed",
    "untracked",
    "added-modified",
    "added-deleted",
    "unknown",
  ];

  const handleFileClick = (filePath: string) => {
    const encodedPath = encodeURIComponent(filePath);
    navigate(`/project/files/view/${encodedPath}`);
  };

  if (isLoading) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (totalChanges === 0) {
    return (
      <ScrollArea className="flex-1">
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              No uncommitted changes
            </p>
            <p className="mt-2 text-muted-foreground text-sm">
              Your working directory is clean
            </p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-semibold text-2xl">Uncommitted Changes</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {totalChanges} {totalChanges === 1 ? "file" : "files"} with changes
          </p>
        </div>

        <div className="space-y-6">
          {statusOrder.map((status) => {
            const files = groupedChanges[status];
            if (!files || files.length === 0) {
              return null;
            }

            return (
              <Card className="p-4" key={status}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">
                      {getStatusLabel(status)} ({files.length})
                    </h3>
                    <Badge
                      className={`flex size-5 items-center justify-center border p-0 font-mono text-[10px] ${getStatusColor(status)}`}
                      variant="outline"
                    >
                      {getStatusBadge(status)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {files.map((filePath) => {
                      const fileName = filePath.split("/").pop() || filePath;
                      const FileIcon = getFileIcon(fileName);
                      return (
                        <div
                          className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-accent/50"
                          key={filePath}
                          onClick={() => handleFileClick(filePath)}
                        >
                          <FileIcon className="size-4 shrink-0" />
                          <span className="truncate font-mono text-foreground text-xs">
                            {filePath}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
