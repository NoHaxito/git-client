import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { SidebarMenuItem } from "@/components/ui/sidebar";
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
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  const currentFilePath = location.pathname.startsWith("/project/files/")
    ? decodeURIComponent(location.pathname.replace("/project/files/", ""))
    : null;

  useEffect(() => {
    setIsExpanded(node.expanded ?? false);
    if (node.children && node.children.length > 0) {
      setChildren(node.children);
    }
  }, [node.expanded, node.children]);

  const loadChildren = useCallback(async () => {
    if (!node.is_dir || children.length > 0) {
      return;
    }

    setIsLoadingChildren(true);
    try {
      const entries = await invoke<
        Array<{ name: string; path: string; is_dir: boolean }>
      >("list_directory", {
        path: node.path,
      });

      const treeNodes: FileTreeNode[] = entries.map((entry) => {
        const entryRelativePath = normalizePath(entry.path, rootPath);
        const status = gitStatus[entryRelativePath] as GitStatus | undefined;
        const isIgnored = checkIfIgnored(
          entry.path,
          rootPath,
          gitignorePatterns
        );
        return {
          ...entry,
          expanded: false,
          children: [],
          gitStatus: status || null,
          isIgnored,
        };
      });

      setChildren(treeNodes);
    } catch (error) {
      console.error("Error loading directory:", error);
    } finally {
      setIsLoadingChildren(false);
    }
  }, [
    node.is_dir,
    node.path,
    children.length,
    rootPath,
    gitStatus,
    gitignorePatterns,
  ]);

  useEffect(() => {
    if (
      isExpanded &&
      node.is_dir &&
      children.length === 0 &&
      (!node.children || node.children.length === 0)
    ) {
      loadChildren();
    }
  }, [isExpanded, node.is_dir, node.path, children.length, loadChildren]);

  const handleToggle = () => {
    if (!node.is_dir) {
      return;
    }

    if (!isExpanded) {
      loadChildren();
    }
    setIsExpanded(!isExpanded);
  };

  const handleFileClick = useCallback(
    (filePath: string) => {
      const encodedPath = encodeURIComponent(filePath);
      navigate(`/project/files/${encodedPath}`);
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
