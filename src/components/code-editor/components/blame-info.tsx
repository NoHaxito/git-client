import { GitBranchIcon, Globe, Hash } from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card";
import { Separator } from "@/components/ui/separator";
import { useAvatarFromOrigin } from "@/hooks/use-avatar-from-origin";
import { useSettings } from "@/hooks/use-settings";
import { getHostFromUrl } from "@/lib/utils";
import { useRepoStore } from "@/stores/repo";
import type { BlameLine } from "../types";
import { timeAgo } from "../utils";

type BlameInfoProps = {
  blameLine?: BlameLine;
};

export function BlameInfo({ blameLine }: BlameInfoProps) {
  const { settings } = useSettings();

  const remoteOrigin = useRepoStore((state) => state.remoteOrigin);
  const showExtendedDetails = settings.editor.gitBlame.extendedDetails;

  const origin = getHostFromUrl(remoteOrigin ?? "") as
    | "github.com"
    | "gitlab.com"
    | null;
  const avatarSrc = useAvatarFromOrigin(origin, blameLine?.author ?? null);

  if (!blameLine) {
    return null;
  }

  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={
          <span className="left-full inline-flex items-center justify-center gap-2 pr-6 pl-6 text-muted-foreground text-xs leading-normal opacity-0 group-hover/line:opacity-100 data-popup-open:opacity-100" />
        }
      >
        <div className="top-0.5 flex items-center gap-1">
          <GitBranchIcon className="size-3" />
          {blameLine.author}, {timeAgo(blameLine.timestamp)}{" "}
          <span className="text-muted-foreground text-xs">•</span>
          <span className="text-muted-foreground text-xs">
            {blameLine.commit_message.slice(0, 20)}...
          </span>
        </div>
      </PreviewCardTrigger>
      <PreviewCardPopup
        align="center"
        className="p-0"
        hidden={!showExtendedDetails}
        side="right"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="size-6 rounded-full">
              <AvatarImage src={avatarSrc ?? undefined} />
              <AvatarFallback>{blameLine.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="text-xs">
                {blameLine.author}{" "}
                <span className="text-muted-foreground text-xs">• </span>
                <span className="text-muted-foreground text-xs">
                  {blameLine.author_email}
                </span>
              </div>
              <div className="text-muted-foreground text-xs">
                {timeAgo(blameLine.timestamp)}
              </div>
            </div>
          </div>

          <div className="px-2 text-muted-foreground text-xs">
            {blameLine.commit_message}
          </div>
          <div className="flex items-center gap-2 border-t p-2">
            <div className="flex items-center gap-1 font-mono text-xs hover:underline">
              <Hash className="size-3 text-muted-foreground" />
              {blameLine.commit_hash.slice(0, 7)}
            </div>
            <Separator orientation="vertical" />
            {remoteOrigin && (
              <Link
                className="flex items-center gap-1 font-mono text-xs hover:underline"
                target="_blank"
                to={`${normalizeRepoOrigin(remoteOrigin)}/commit/${blameLine.commit_hash}`}
              >
                <Globe className="size-3 text-muted-foreground" />
                Open in browser
              </Link>
            )}
          </div>
        </div>
      </PreviewCardPopup>
    </PreviewCard>
  );
}

function normalizeRepoOrigin(origin: string) {
  if (origin.endsWith(".git")) {
    return origin.slice(0, -4);
  }
  return origin;
}
