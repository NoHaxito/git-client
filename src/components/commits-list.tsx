import { useVirtualizer } from "@tanstack/react-virtual";
import { GitCommitIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommitDetails, useGitCommits } from "@/hooks/tauri-queries";

type Commit = {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString();
  } catch {
    return dateStr;
  }
}

function CommitDetailsDialog({
  commit,
  repoPath,
}: {
  commit: Commit;
  repoPath: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    data: details,
    isLoading,
    error,
  } = useCommitDetails(isOpen ? repoPath : null, isOpen ? commit.hash : null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "added":
        return "text-green-500";
      case "modified":
        return "text-blue-500";
      case "deleted":
        return "text-red-500";
      case "renamed":
        return "text-yellow-500";
      default:
        return "text-muted-foreground";
    }
  };

  const errorMessage =
    error instanceof Error ? error.message : "Failed to load commit details";

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger
        render={
          <SidebarMenuButton
            className="w-full cursor-pointer"
            size="lg"
            type="button"
          >
            <GitCommitIcon className="size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-mono text-muted-foreground text-xs">
                  {commit.hash.slice(0, 7)}
                </span>
                <span className="line-clamp-1 max-w-[200px] text-xs">
                  {commit.message}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <span className="truncate">{commit.author}</span>
                <span>•</span>
                <span className="shrink-0">{formatDate(commit.date)}</span>
              </div>
            </div>
          </SidebarMenuButton>
        }
      />
      <DialogPopup className="max-w-2xl">
        <DialogTitle className="px-6 pt-6 pb-6">Commit Details</DialogTitle>
        <ScrollArea className="max-h-[calc(100vh-12rem)]">
          <div className="px-6 pb-6">
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            )}
            {error && (
              <div className="text-muted-foreground text-sm">
                {errorMessage}
              </div>
            )}
            {details && !isLoading && (
              <div className="space-y-4">
                <div>
                  <div className="font-mono text-muted-foreground text-xs">
                    {details.hash}
                  </div>
                  <div className="mt-1 font-medium text-base">
                    {details.message}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 divide-x text-muted-foreground text-sm">
                    <div className="flex items-center gap-1 pr-2">
                      <span className="line-clamp-1" title={details.author}>
                        {details.author}
                      </span>
                      <span className="line-clamp-1" title={details.email}>
                        &lt;{details.email}&gt;
                      </span>
                    </div>
                    <span
                      className="line-clamp-1 text-center"
                      title={details.date}
                    >
                      {formatDate(details.date)}
                    </span>
                  </div>
                </div>

                {details.stats && (
                  <div className="rounded-md bg-muted/50 p-3 font-mono text-xs">
                    {details.stats}
                  </div>
                )}

                {details.files.length > 0 && (
                  <div>
                    <div className="mb-2 font-medium text-sm">
                      Changed Files ({details.files.length})
                    </div>
                    <div className="space-y-1">
                      {details.files.map((file, index) => (
                        <div
                          className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent/50"
                          key={`${file.path}-${index}`}
                        >
                          <span
                            className={`shrink-0 font-medium text-xs ${getStatusColor(file.status)}`}
                          >
                            {file.status.charAt(0).toUpperCase()}
                          </span>
                          <span className="truncate font-mono text-xs">
                            {file.path}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogPopup>
    </Dialog>
  );
}

export function CommitsList({
  parentRef,
  repoPath,
}: {
  parentRef: React.RefObject<HTMLDivElement>;
  repoPath: string;
}) {
  const {
    data: commits = [],
    isLoading,
    error,
  } = useGitCommits(repoPath || null);

  const virtualizer = useVirtualizer({
    count: commits.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 px-2 py-1.5">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load commits";
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
        {errorMessage}
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
        No commits found
      </div>
    );
  }

  const items = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      style={{
        height: `${totalSize}px`,
        width: "100%",
        position: "relative",
      }}
    >
      <SidebarMenu className="absolute inset-x-0 gap-0">
        {items.map((virtualItem) => {
          const commit = commits[virtualItem.index];
          return (
            <SidebarMenuItem
              key={commit.hash}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <CommitDetailsDialog commit={commit} repoPath={repoPath} />
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
}
