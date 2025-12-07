import { revealItemInDir } from "@tauri-apps/plugin-opener";
import {
  ArrowRightIcon,
  CopyIcon,
  FolderOpenIcon,
  Trash2Icon,
} from "lucide-react";
import { Link } from "react-router";
import type { ContextMenuTrigger as ContextMenuTriggerComponent } from "@/components/ui/context-menu";
import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { normalizePath } from "./utils";

type ItemContextMenuProps = {
  children: React.ComponentProps<typeof ContextMenuTriggerComponent>["render"];
  path: string;
  rootPath: string;
};

export function ItemContextMenu({
  children,
  path,
  rootPath,
}: ItemContextMenuProps) {
  const handleReveal = async () => {
    try {
      await revealItemInDir(path);
    } catch (error) {
      console.error("Error revealing in file explorer:", error);
    }
  };

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(path);
    } catch (error) {
      console.error("Error copying path:", error);
    }
  };

  const handleCopyRelativePath = async () => {
    try {
      await navigator.clipboard.writeText(normalizePath(path, rootPath));
    } catch (error) {
      console.error("Error copying relative path:", error);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger render={children} />
      <ContextMenuPopup className="outline-none">
        <ContextMenuItem render={<Link to={`/project/files/${path}`} />}>
          <ArrowRightIcon className="size-4 group-data-highlighted:fill-current" />
          Open
        </ContextMenuItem>
        <ContextMenuItem onClick={handleReveal}>
          <FolderOpenIcon className="size-4 group-data-highlighted:fill-current" />
          Reveal in File Explorer
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onClick={handleCopyPath}>
            <CopyIcon className="size-4" />
            Copy Path
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopyRelativePath}>
            <CopyIcon className="size-4" />
            Copy Relative Path
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <Trash2Icon className="size-4" />
          Delete File
        </ContextMenuItem>
      </ContextMenuPopup>
    </ContextMenu>
  );
}
