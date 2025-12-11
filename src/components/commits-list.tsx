import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useGitCommits } from "@/hooks/tauri-queries";

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

function CommitItem({ commit }: { commit: Commit }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/commits/${commit.hash}`);
  };

  return (
    <SidebarMenuButton
      className="w-full cursor-pointer"
      isActive={location.pathname.includes(`/project/commits/${commit.hash}`)}
      onClick={handleClick}
      size="lg"
      type="button"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="shrink-0 font-mono text-muted-foreground text-xs">
            {commit.hash.slice(0, 7)}
          </span>
          <span className="line-clamp-1 max-w-[220px] text-xs">
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
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGitCommits(repoPath || null);

  const commits = useMemo(() => data?.pages.flat() ?? [], [data]);

  const virtualizer = useVirtualizer({
    count: commits.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const items = virtualizer.getVirtualItems();
  const lastVisibleIndex = useMemo(() => {
    if (items.length === 0) {
      return -1;
    }
    return Math.max(...items.map((item) => item.index));
  }, [items]);

  useEffect(() => {
    if (lastVisibleIndex === -1 || commits.length === 0) {
      return;
    }

    const endIndex = commits.length - 1;
    const threshold = 10;

    if (
      lastVisibleIndex >= endIndex - threshold &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    lastVisibleIndex,
    commits.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

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

  if (!isLoading && commits.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
        No commits found
      </div>
    );
  }

  const totalSize = virtualizer.getTotalSize();

  return (
    <div
      style={{
        height: `${totalSize}px`,
        width: "100%",
        position: "relative",
      }}
    >
      <SidebarMenu className="absolute inset-x-0">
        {items.map((virtualItem) => {
          const commit = commits[virtualItem.index];
          if (!commit) {
            return (
              <SidebarMenuItem
                key={`loading-${virtualItem.index}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <Skeleton className="h-10 w-full" />
              </SidebarMenuItem>
            );
          }
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
              <CommitItem commit={commit} />
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
      {isFetchingNextPage && (
        <div className="absolute right-0 bottom-0 left-0 flex justify-center p-2">
          <Skeleton className="h-10 w-full" />
        </div>
      )}
    </div>
  );
}
