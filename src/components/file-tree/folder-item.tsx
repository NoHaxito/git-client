import { ChevronRight, Folder, Loader2Icon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuSub } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { GitStatusBadge } from "./git-status-badge";
import { ItemContextMenu } from "./item-context-menu";
import type { FileTreeNode } from "./types";

type FolderItemProps = {
  node: FileTreeNode;
  isExpanded: boolean;
  isLoading: boolean;
  onToggle: () => void;
  rootPath: string;
  children: React.ReactNode;
};

export function FolderItem({
  node,
  isExpanded,
  isLoading,
  onToggle,
  rootPath,
  children,
}: FolderItemProps) {
  return (
    <>
      <ItemContextMenu is_dir={true} path={node.path} rootPath={rootPath}>
        <SidebarMenuButton
          className={cn(
            "h-6 gap-1.5 px-1.5 text-xs",
            node.isIgnored && "opacity-50"
          )}
          data-state={isExpanded ? "open" : "closed"}
          onClick={onToggle}
          size="sm"
          tooltip={node.path}
        >
          <ChevronRight
            className={cn(
              "size-3 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )}
          />
          <Folder className="size-3 shrink-0 text-muted-foreground" />
          <span className="min-w-0 truncate">{node.name}</span>
          {isLoading && (
            <Loader2Icon className="ml-auto size-3 shrink-0 animate-spin text-muted-foreground" />
          )}
          <GitStatusBadge status={node.gitStatus || null} />
        </SidebarMenuButton>
      </ItemContextMenu>
      {isExpanded && (
        <SidebarMenuSub className="mx-0.5 gap-0 border-sidebar-border/50 border-l px-0.5 py-0">
          {children}
        </SidebarMenuSub>
      )}
    </>
  );
}
