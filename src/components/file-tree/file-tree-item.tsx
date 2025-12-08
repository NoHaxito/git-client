import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { useListDirectory } from "@/hooks/tauri-queries";
import { FileItem } from "./file-item";
import { FolderItem } from "./folder-item";
import { checkIfIgnored } from "./gitignore-utils";
import type { FileTreeNode, GitStatus } from "./types";
import { normalizePath } from "./utils";

type FileTreeItemProps = {
  node: FileTreeNode;
  rootPath: string;
  gitStatus: Record<string, string>;
  gitignorePatterns: string[];
};

export function FileTreeItem({
  node,
  rootPath,
  gitStatus,
  gitignorePatterns,
}: FileTreeItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(node.expanded ?? false);
  const [children, setChildren] = useState<FileTreeNode[]>(node.children ?? []);

  const currentFilePath = location.pathname.startsWith("/project/files/")
    ? decodeURIComponent(location.pathname.replace("/project/files/", ""))
    : null;

  const { data: entries, isLoading: isLoadingChildren } = useListDirectory(
    isExpanded && node.is_dir && children.length === 0 ? node.path : null
  );

  useEffect(() => {
    setIsExpanded(node.expanded ?? false);
    if (node.children && node.children.length > 0) {
      setChildren(node.children);
    }
  }, [node.expanded, node.children]);

  useEffect(() => {
    if (!entries || children.length > 0) {
      return;
    }

    const treeNodes: FileTreeNode[] = entries.map((entry) => {
      const entryRelativePath = normalizePath(entry.path, rootPath);
      const status = gitStatus[entryRelativePath] as GitStatus | undefined;
      const isIgnored = checkIfIgnored(entry.path, rootPath, gitignorePatterns);
      return {
        ...entry,
        expanded: false,
        children: [],
        gitStatus: status || null,
        isIgnored,
      };
    });

    setChildren(treeNodes);
  }, [entries, rootPath, gitStatus, gitignorePatterns, children.length]);

  const handleToggle = () => {
    if (!node.is_dir) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleFileClick = useCallback(
    (filePath: string) => {
      const encodedPath = encodeURIComponent(filePath);
      navigate(`/project/files/view/${encodedPath}`);
    },
    [navigate]
  );

  if (!node.is_dir) {
    return (
      <SidebarMenuItem>
        <FileItem
          isActive={currentFilePath === node.path}
          node={node}
          onFileClick={handleFileClick}
          rootPath={rootPath}
        />
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <FolderItem
        isExpanded={isExpanded}
        isLoading={isLoadingChildren}
        node={node}
        onToggle={handleToggle}
        rootPath={rootPath}
      >
        {children.map((child) => (
          <FileTreeItem
            gitignorePatterns={gitignorePatterns}
            gitStatus={gitStatus}
            key={child.path}
            node={child}
            rootPath={rootPath}
          />
        ))}
      </FolderItem>
    </SidebarMenuItem>
  );
}
