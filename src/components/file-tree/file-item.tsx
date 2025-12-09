import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { getFileIcon } from "./file-icon";
import { GitStatusBadge, getStatusColor } from "./git-status-badge";
import { ItemContextMenu } from "./item-context-menu";
import type { FileTreeNode } from "./types";

type FileItemProps = {
  node: FileTreeNode;
  onFileClick: (path: string) => void;
  rootPath: string;
  isActive?: boolean;
};

export function FileItem({
  node,
  onFileClick,
  rootPath,
  isActive,
}: FileItemProps) {
  const FileIcon = getFileIcon(node.name);
  const statusColor = getStatusColor(node.gitStatus || null);

  return (
    <ItemContextMenu
      hasModifications={node.gitStatus}
      is_dir={node.is_dir}
      path={node.path}
      rootPath={rootPath}
    >
      <SidebarMenuButton
        className={cn(
          "h-6 gap-1.5 px-1.5 text-xs",
          node.isIgnored && "opacity-50"
        )}
        isActive={isActive}
        onClick={() => onFileClick(node.path)}
        size="sm"
        tooltip={{
          children: `${node.path} ${
            node.gitStatus
              ? `- ${node.gitStatus.charAt(0).toUpperCase() + node.gitStatus.slice(1)}`
              : ""
          }`,
          hidden: false,
        }}
      >
        <FileIcon className={cn("size-3 shrink-0", statusColor)} />
        <span className="min-w-0 truncate">{node.name}</span>
        <GitStatusBadge status={node.gitStatus || null} />
      </SidebarMenuButton>
    </ItemContextMenu>
  );
}
