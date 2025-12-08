/** biome-ignore-all lint/complexity/noUselessFragments: Fragment is used to group elements */

import { FolderGit2Icon } from "lucide-react";
import { WindowControls } from "../window-controls";
import { BranchSelector } from "./branch-selector";
import { NavigationButtons } from "./navigation-buttons";
import { NotificationsPopover } from "./notifications-popover";

export function StatusBar() {
  return (
    <div className="z-50 flex h-10 max-h-10 min-h-10 w-full items-center justify-between gap-2 border-b bg-sidebar text-xs">
      <div
        className="flex w-full items-center justify-between"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-2 px-3">
          <div className="flex size-6 items-center justify-center gap-2 rounded-lg bg-sidebar-primary">
            <FolderGit2Icon className="size-3" />
          </div>
          <NavigationButtons />
          <BranchSelector />
        </div>
        <div className="flex items-center gap-2">
          <div data-diff-details />
          <NotificationsPopover />
          <WindowControls />
        </div>
      </div>
    </div>
  );
}
