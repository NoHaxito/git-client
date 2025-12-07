import { GitBranchIcon } from "lucide-react";
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@/components/ui/preview-card";
import type { BlameLine } from "../types";
import { timeAgo } from "../utils";

type BlameInfoProps = {
  blameLine?: BlameLine;
};

export function BlameInfo({ blameLine }: BlameInfoProps) {
  if (!blameLine) {
    return null;
  }

  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={
          <span className="-top-[2px] absolute left-full ml-8 inline-flex items-center gap-2 text-muted-foreground" />
        }
      >
        <GitBranchIcon className="size-4" />
        {blameLine.author}, {timeAgo(blameLine.timestamp)}
      </PreviewCardTrigger>
      <PreviewCardPopup align="center" className="p-2" side="right">
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
