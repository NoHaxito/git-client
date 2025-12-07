import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { SidebarMenu } from "@/components/ui/sidebar";
import { FileTreeItem } from "./file-tree-item";
import { checkIfIgnored, loadGitignore } from "./gitignore-utils";
import type { FileTreeNode, GitStatus } from "./types";
import { normalizePath, PATH_SEPARATOR_REGEX } from "./utils";

async function loadTreeRecursively(
  node: FileTreeNode,
  rootPath: string,
  gitStatus: Record<string, string>,
  gitignorePatterns: string[]
): Promise<FileTreeNode> {
  if (!node.is_dir) {
    return node;
  }

  try {
    const entries = await invoke<
      Array<{ name: string; path: string; is_dir: boolean }>
    >("list_directory", {
      path: node.path,
    });

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
          gitignorePatterns
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
  const [rootNode, setRootNode] = useState<FileTreeNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gitStatus, setGitStatus] = useState<Record<string, string>>({});
  const [gitignorePatterns, setGitignorePatterns] = useState<string[]>([]);

  useEffect(() => {
    const loadRoot = async () => {
      setIsLoading(true);
      try {
        const [entries, status, patterns] = await Promise.all([
          invoke<Array<{ name: string; path: string; is_dir: boolean }>>(
            "list_directory",
            {
              path: rootPath,
            }
          ),
          invoke<Record<string, string>>("get_git_status", {
            repoPath: rootPath,
          }).catch(() => ({}) as Record<string, string>),
          loadGitignore(rootPath),
        ]);

        setGitStatus(status);
        setGitignorePatterns(patterns);

        const treeNodes: FileTreeNode[] = entries.map((entry) => {
          const entryRelativePath = normalizePath(entry.path, rootPath);
          const entryStatus = status[entryRelativePath] as
            | GitStatus
            | undefined;
          const isIgnored = checkIfIgnored(entry.path, rootPath, patterns);

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
          const fullyLoadedRoot = await loadTreeRecursively(
            root,
            rootPath,
            status,
            patterns
          );
          setRootNode(fullyLoadedRoot);
        } else {
          setRootNode(root);
        }
      } catch (error) {
        console.error("Error loading root directory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoot();
  }, [rootPath, searchQuery]);

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
    <SidebarMenu className="gap-0">
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
  );
}
