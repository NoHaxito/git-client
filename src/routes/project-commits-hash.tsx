import { ArrowLeftIcon, CalendarIcon, ExternalLinkIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommitDetails } from "@/hooks/tauri-queries";
import { useAvatarFromOrigin } from "@/hooks/use-avatar-from-origin";
import { getGitOrigin } from "@/lib/get-git-origin";
import { getHostFromUrl } from "@/lib/utils";
import { useRepoStore } from "@/stores/repo";

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString();
  } catch {
    return dateStr;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "added":
      return "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400";
    case "modified":
      return "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "deleted":
      return "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400";
    case "renamed":
      return "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    default:
      return "border-muted-foreground/50 bg-muted text-muted-foreground";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "added":
      return "A";
    case "modified":
      return "M";
    case "deleted":
      return "D";
    case "renamed":
      return "R";
    default:
      return "?";
  }
}

export default function ProjectCommitDetails() {
  const navigate = useNavigate();
  const { hash } = useParams<{ hash: string }>();
  const remoteOrigin = useRepoStore((state) => state.remoteOrigin);
  const currentRepo = useRepoStore((state) => state.currentRepo);

  const {
    data: details,
    isLoading,
    error,
  } = useCommitDetails(currentRepo, hash || null);

  const avatarSrc = useAvatarFromOrigin(
    getHostFromUrl(remoteOrigin ?? "") as "github.com" | "gitlab.com" | null,
    details?.author ?? null
  );

  const errorMessage =
    error instanceof Error ? error.message : "Failed to load commit details";

  const handleBack = () => {
    navigate("/project/commits");
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center">
        <div className="text-muted-foreground text-sm">{errorMessage}</div>
        <Button className="mt-4" onClick={handleBack} variant="outline">
          <ArrowLeftIcon className="mr-2 size-4" />
          Back to Commits
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex items-center gap-2 border-b p-2 px-6">
        <Button onClick={handleBack} size="icon-sm" variant="ghost">
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="flex flex-col">
          <div className="font-mono text-muted-foreground text-xs">
            {details.hash}
          </div>
          <div className="font-medium text-base">{details.message}</div>
        </div>
        <div className="ml-auto">
          <Button
            render={
              <Link
                target="_blank"
                to={`${remoteOrigin}/commit/${details.hash}`}
              />
            }
            size="sm"
            variant="ghost"
          >
            <ExternalLinkIcon className="size-4" />
            Open in {getGitOrigin(remoteOrigin ?? "")}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col-reverse gap-2 p-6 xl:flex-row">
          <div className="flex-1">
            {details.files.length > 0 && (
              <Card className="p-4">
                <div className="space-y-3">
                  <h3 className="font-medium text-sm">
                    Changed Files ({details.files.length})
                  </h3>
                  <div className="space-y-1">
                    {details.files.map((file, index) => (
                      <div
                        className="flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-accent/50"
                        key={`${file.path}-${index}`}
                      >
                        <Badge
                          className={`flex size-6 items-center justify-center border font-mono text-xs ${getStatusColor(file.status)}`}
                          variant="outline"
                        >
                          {getStatusBadge(file.status)}
                        </Badge>
                        <span className="truncate font-mono text-foreground text-xs">
                          {file.path}
                        </span>
                        {file.additions !== undefined &&
                          file.deletions !== undefined && (
                            <div className="ml-auto flex items-center gap-2 text-muted-foreground text-xs">
                              {file.additions > 0 && (
                                <span className="text-green-600 dark:text-green-400">
                                  +{file.additions}
                                </span>
                              )}
                              {file.deletions > 0 && (
                                <span className="text-red-600 dark:text-red-400">
                                  -{file.deletions}
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
          <div className="top-6 grid w-full min-w-96 gap-2 self-start xl:sticky xl:w-96 xl:max-w-96">
            <Card className="p-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={avatarSrc ?? undefined} />
                    <AvatarFallback>{details.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p
                        className="font-medium text-foreground text-sm"
                        title={details.author}
                      >
                        {details.author}
                      </p>
                    </div>
                    <p
                      className="text-muted-foreground text-xs"
                      title={details.email}
                    >
                      {details.email}
                    </p>
                  </div>
                </div>
                <Separator orientation="horizontal" />
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span
                      className="font-medium text-foreground text-sm"
                      title={details.date}
                    >
                      {formatDate(details.date)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {details.stats && (
              <Card className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Statistics</h3>
                  <div className="rounded-md bg-muted/30 p-3 font-mono text-xs">
                    {details.stats}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
