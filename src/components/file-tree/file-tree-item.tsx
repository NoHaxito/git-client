import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { useFileStore } from "@/stores/file";
import { FileItem } from "./file-item";
import { FolderItem } from "./folder-item";
import type { FileTreeNode, GitStatus } from "./types";
import { normalizePath } from "./utils";

type FileTreeItemProps = {
  node: FileTreeNode;
  rootPath: string;
  gitStatus: Record<string, string>;
};

export function FileTreeItem({ node, rootPath, gitStatus }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(node.expanded ?? false);
  const [children, setChildren] = useState<FileTreeNode[]>(node.children ?? []);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const openFilePath = useFileStore((state) => state.openFilePath);

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
        return {
          ...entry,
          expanded: false,
          children: [],
          gitStatus: status || null,
        };
      });

      setChildren(treeNodes);
    } catch (error) {
      console.error("Error loading directory:", error);
    } finally {
      setIsLoadingChildren(false);
    }
  }, [node.is_dir, node.path, children.length, rootPath, gitStatus]);

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

  const setOpenFile = useFileStore((state) => state.setOpenFile);
  const setFileLoading = useFileStore((state) => state.setIsLoading);

  const handleFileClick = useCallback(
    async (filePath: string) => {
      setOpenFile(filePath);
      setFileLoading(true);
      try {
        const content = await invoke<string>("read_file", { path: filePath });
        useFileStore.getState().setFileContent(content);
      } catch (error) {
        console.error("Error reading file:", error);
        useFileStore.getState().setFileContent(null);
      } finally {
        setFileLoading(false);
      }
    },
    [setOpenFile, setFileLoading]
  );

  if (!node.is_dir) {
    return (
      <SidebarMenuItem>
        <FileItem
          isActive={openFilePath === node.path}
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
