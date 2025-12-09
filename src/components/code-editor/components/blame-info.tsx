import { GitBranchIcon } from "lucide-react";
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card";
import { useSettings } from "@/hooks/use-settings";
import type { BlameLine } from "../types";
import { timeAgo } from "../utils";

type BlameInfoProps = {
  blameLine?: BlameLine;
};

export function BlameInfo({ blameLine }: BlameInfoProps) {
  const { settings } = useSettings();

  const showExtendedDetails = settings.editor.gitBlame.extendedDetails;

  if (!blameLine) {
    return null;
  }

  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={
          <span className="absolute left-full inline-flex items-center gap-2 pr-6 pl-6 text-muted-foreground text-sm leading-normal opacity-0 group-hover/line:opacity-100" />
        }
      >
        <GitBranchIcon className="size-3" />
        {blameLine.author}, {timeAgo(blameLine.timestamp)}{" "}
        <span className="text-muted-foreground text-xs">•</span>
        <span className="text-muted-foreground text-xs">
          {blameLine.commit_message.slice(0, 20)}...
        </span>
      </PreviewCardTrigger>
      <PreviewCardPopup
        align="center"
        className="p-2"
        hidden={!showExtendedDetails}
        side="right"
      >
        <div>
          <div className="font-mono text-xs">
            {blameLine.commit_hash.slice(0, 7)}
          </div>
          <div className="mt-1 text-muted-foreground text-xs">
            {blameLine.commit_message}
          </div>
        </div>
      </PreviewCardPopup>
    </PreviewCard>
  );
}
