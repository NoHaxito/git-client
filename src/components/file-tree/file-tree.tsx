import { useQueryClient } from "@tanstack/react-query";
import { FolderOpenIcon, FolderSync } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarMenu } from "@/components/ui/sidebar";
import {
  useCurrentGitBranch,
  useGitStatus,
  useListDirectory,
  usePullGitRepo,
} from "@/hooks/tauri-queries";
import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { FileTreeItem } from "./file-tree-item";
import { checkIfIgnored, loadGitignore } from "./gitignore-utils";
import type { FileTreeNode, GitStatus } from "./types";
import { normalizePath, PATH_SEPARATOR_REGEX } from "./utils";

async function loadTreeRecursively(
  node: FileTreeNode,
  rootPath: string,
  gitStatus: Record<string, string>,
  gitignorePatterns: string[],
  listDirectoryFn: (
    path: string
  ) => Promise<Array<{ name: string; path: string; is_dir: boolean }>>
): Promise<FileTreeNode> {
  if (!node.is_dir) {
    return node;
  }

  try {
    const entries = await listDirectoryFn(node.path);

    const childrenPromises = entries.map(async (entry) => {
      const entryRelativePath = normalizePath(entry.path, rootPath);
      const status = gitStatus[entryRelativePath] as GitStatus | undefined;
      const isIgnored = checkIfIgnored(entry.path, rootPath, gitignorePatterns);

      const childNode: FileTreeNode = {
        ...entry,
        expanded: false,
        children: [],
        gitStatus: status || null,
        isIgnored,
      };

      if (entry.is_dir) {
        return await loadTreeRecursively(
          childNode,
          rootPath,
          gitStatus,
          gitignorePatterns,
          listDirectoryFn
        );
      }

      return childNode;
    });

    const children = await Promise.all(childrenPromises);

    return {
      ...node,
      children,
    };
  } catch (error) {
    console.error(`Error loading directory ${node.path}:`, error);
    return {
      ...node,
      children: [],
    };
  }
}

function filterTree(
  node: FileTreeNode,
  searchQuery: string
): FileTreeNode | null {
  if (!searchQuery.trim()) {
    return node;
  }

  const query = searchQuery.toLowerCase();
  const nodeNameLower = node.name.toLowerCase();

  if (node.is_dir) {
    const filteredChildren = (node.children || [])
      .map((child) => filterTree(child, searchQuery))
      .filter((child): child is FileTreeNode => child !== null);

    if (nodeNameLower.includes(query) || filteredChildren.length > 0) {
      return {
        ...node,
        expanded: true,
        children: filteredChildren,
      };
    }

    return null;
  }

  if (nodeNameLower.includes(query)) {
    return node;
  }

  return null;
}

type FileTreeProps = {
  rootPath: string;
  searchQuery?: string;
};

export function FileTree({ rootPath, searchQuery = "" }: FileTreeProps) {
  const queryClient = useQueryClient();
  const [rootNode, setRootNode] = useState<FileTreeNode | null>(null);
  const [gitignorePatterns, setGitignorePatterns] = useState<string[]>([]);

  const { data: entries, isLoading: isLoadingEntries } =
    useListDirectory(rootPath);
  const { data: gitStatus = {}, isLoading: isLoadingStatus } =
    useGitStatus(rootPath);
  const { data: currentBranch } = useCurrentGitBranch(rootPath);
  const pullMutation = usePullGitRepo();

  const isLoading = isLoadingEntries || isLoadingStatus;

  useEffect(() => {
    const loadPatterns = async () => {
      const patterns = await loadGitignore(rootPath);
      setGitignorePatterns(patterns);
    };
    loadPatterns();
  }, [rootPath]);

  useEffect(() => {
    if (!entries || isLoading) {
      return;
    }

    const buildTree = async () => {
      const treeNodes: FileTreeNode[] = entries.map((entry) => {
        const entryRelativePath = normalizePath(entry.path, rootPath);
        const entryStatus = gitStatus[entryRelativePath] as
          | GitStatus
          | undefined;
        const isIgnored = checkIfIgnored(
          entry.path,
          rootPath,
          gitignorePatterns
        );

        return {
          ...entry,
          expanded: false,
          children: [],
          gitStatus: entryStatus || null,
          isIgnored,
        };
      });

      const root: FileTreeNode = {
        name: rootPath.split(PATH_SEPARATOR_REGEX).at(-1) || rootPath,
        path: rootPath,
        is_dir: true,
        expanded: true,
        children: treeNodes,
        gitStatus: null,
        isIgnored: false,
      };

      if (searchQuery.trim()) {
        const listDirectoryFn = async (path: string) => {
          const data = await queryClient.fetchQuery({
            queryKey: ["list-directory", path],
            queryFn: async () => {
              const { invoke } = await import("@tauri-apps/api/core");
              return invoke<
                Array<{ name: string; path: string; is_dir: boolean }>
              >("list_directory", { path });
            },
          });
          return data;
        };
        const fullyLoadedRoot = await loadTreeRecursively(
          root,
          rootPath,
          gitStatus,
          gitignorePatterns,
          listDirectoryFn
        );
        setRootNode(fullyLoadedRoot);
      } else {
        setRootNode(root);
      }
    };

    buildTree();
  }, [
    entries,
    gitStatus,
    gitignorePatterns,
    rootPath,
    searchQuery,
    isLoading,
    queryClient,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (!rootNode) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
        No files found
      </div>
    );
  }

  const filteredRootNode = searchQuery.trim()
    ? filterTree(rootNode, searchQuery)
    : rootNode;

  if (!filteredRootNode) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
        No files found
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <SidebarMenu className="flex-1 gap-0">
            {filteredRootNode.children?.map((child) => (
              <FileTreeItem
                gitignorePatterns={gitignorePatterns}
                gitStatus={gitStatus}
                key={child.path}
                node={child}
                rootPath={rootPath}
              />
            ))}
          </SidebarMenu>
        }
      />
      <ContextMenuPopup align="start" className="w-52">
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={async () => {
              if (!currentBranch) {
                return;
              }
              try {
                await pullMutation.mutateAsync({
                  repoPath: rootPath,
                  branchName: currentBranch,
                });
              } catch (error) {
                console.error("Error pulling repository:", error);
              }
            }}
          >
            <FolderSync />
            Synchronize Changes
          </ContextMenuItem>
          <ContextMenuItem className="data-highlighted:[&>svg]:fill-current">
            <FolderOpenIcon />
            Reveal in File Explorer
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuPopup>
    </ContextMenu>
  );
}
