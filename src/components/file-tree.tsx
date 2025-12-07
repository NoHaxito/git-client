import {
  BracketsYellow,
  CLang,
  Clojure,
  Cplus,
  Dart,
  Docker,
  Document,
  Elixir,
  Erlang,
  Exe,
  Folder,
  Git,
  Go,
  Graphql,
  Haskell,
  Java,
  Js,
  Kotlin,
  Lock,
  Lua,
  Markdown,
  Perl,
  PHP,
  Python,
  R,
  Reactjs,
  Reactts,
  Ruby,
  Rust,
  Sass,
  Scala,
  Shell,
  Svelte,
  Swift,
  TypeScript,
  Vue,
  XML,
  Yaml,
} from "@react-symbols/icons";
import { invoke } from "@tauri-apps/api/core";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import {
  ChevronRight,
  CopyIcon,
  FolderOpenIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import type { FC, SVGProps } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useFileStore } from "@/stores/file";

const PATH_SEPARATOR_REGEX = /[/\\]/;

const FILE_ICON_MAP: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  js: Js,
  mjs: Js,
  jsx: Reactjs,
  ts: TypeScript,
  tsx: Reactts,
  json: BracketsYellow,
  css: Sass,
  scss: Sass,
  sass: Sass,
  html: Document,
  htm: Document,
  md: Markdown,
  mdx: Markdown,
  yml: Yaml,
  yaml: Yaml,
  xml: XML,
  lock: Lock,
  gitignore: Git,
  rs: Rust,
  py: Python,
  java: Java,
  c: CLang,
  cpp: Cplus,
  cc: Cplus,
  cxx: Cplus,
  go: Go,
  php: PHP,
  rb: Ruby,
  vue: Vue,
  svelte: Svelte,
  dart: Dart,
  swift: Swift,
  kt: Kotlin,
  kts: Kotlin,
  sh: Shell,
  bash: Shell,
  zsh: Shell,
  dockerfile: Docker,
  sql: Document,
  graphql: Graphql,
  gql: Graphql,
  r: R,
  scala: Scala,
  clj: Clojure,
  cljs: Clojure,
  hs: Haskell,
  ex: Elixir,
  exs: Elixir,
  erl: Erlang,
  hrl: Erlang,
  lua: Lua,
  pl: Perl,
  exe: Exe,
};

import type { ContextMenuTrigger as ContextMenuTriggerComponent } from "@/components/ui/context-menu";
import {
  ContextMenu,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function getFileIcon(fileName: string): FC<SVGProps<SVGSVGElement>> {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return FILE_ICON_MAP[extension] || Document;
}

type DirectoryEntry = {
  name: string;
  path: string;
  is_dir: boolean;
};

type GitStatus =
  | "modified"
  | "added"
  | "deleted"
  | "renamed"
  | "untracked"
  | "unknown"
  | null;

type FileTreeNode = DirectoryEntry & {
  children?: FileTreeNode[];
  expanded?: boolean;
  gitStatus?: GitStatus;
};

const STATUS_COLOR_MAP: Record<string, string> = {
  modified: "text-orange-500",
  added: "text-green-500",
  deleted: "text-red-500",
  renamed: "text-blue-500",
  untracked: "text-yellow-500",
};

function getStatusColor(status: GitStatus): string {
  return status
    ? STATUS_COLOR_MAP[status] || "text-muted-foreground"
    : "text-muted-foreground";
}

function normalizePath(path: string, repoRoot: string): string {
  const normalized = path.replace(/\\/g, "/");
  const rootNormalized = repoRoot.replace(/\\/g, "/");

  if (normalized.startsWith(rootNormalized)) {
    return normalized.slice(rootNormalized.length + 1);
  }
  return normalized;
}

function getStatusLetter(status: GitStatus): string {
  if (!status) {
    return "";
  }

  const letterMap: Record<string, string> = {
    modified: "M",
    added: "A",
    deleted: "D",
    renamed: "R",
    untracked: "U",
  };

  return letterMap[status] || "";
}

function getStatusLetterColor(status: GitStatus): string {
  if (!status) {
    return "";
  }

  const colorMap: Record<string, string> = {
    modified: "text-orange-500",
    added: "text-green-500",
    deleted: "text-red-500",
    renamed: "text-blue-500",
    untracked: "text-yellow-500",
  };

  return colorMap[status] || "";
}

function renderFileItem(
  node: FileTreeNode,
  indent: number,
  onFileClick: (path: string) => void,
  rootPath: string,
  isActive?: boolean
) {
  const FileIcon = getFileIcon(node.name);
  const statusColor = getStatusColor(node.gitStatus || null);
  const statusLetter = getStatusLetter(node.gitStatus || null);
  const statusLetterColor = getStatusLetterColor(node.gitStatus || null);

  return (
    <ItemContextMenu path={node.path} rootPath={rootPath}>
      <button
        className="flex w-full cursor-pointer items-center gap-1.5 truncate whitespace-normal px-2 py-1 text-left text-sm hover:bg-accent data-selected:bg-accent"
        title={`${node.path} ${node.gitStatus ? `- ${node.gitStatus.charAt(0).toUpperCase() + node.gitStatus.slice(1)}` : ""}`}
        {...(isActive && { "data-selected": true })}
        onClick={() => onFileClick(node.path)}
        style={{ paddingLeft: `${indent + 8}px` }}
        type="button"
      >
        <FileIcon
          className={cn(
            "size-4 shrink-0",
            statusColor,
            indent === 0 ? "ml-[22.5px]" : "ml-4"
          )}
        />
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        {node.gitStatus && statusLetter && (
          <span
            className={cn(
              "ml-auto shrink-0 pr-1 font-medium text-xs",
              statusLetterColor
            )}
          >
            {statusLetter}
          </span>
        )}
      </button>
    </ItemContextMenu>
  );
}

function FileTreeItem({
  node,
  level = 0,
  rootPath,
  gitStatus,
}: {
  node: FileTreeNode;
  level?: number;
  rootPath: string;
  gitStatus: Record<string, string>;
}) {
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
      const entries = await invoke<DirectoryEntry[]>("list_directory", {
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

  const indent = level * 16;
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
    return renderFileItem(
      node,
      indent,
      handleFileClick,
      rootPath,
      openFilePath === node.path
    );
  }

  return (
    <Collapsible onOpenChange={setIsExpanded} open={isExpanded}>
      <ItemContextMenu path={node.path} rootPath={rootPath}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-1.5 px-2 py-1 text-sm hover:bg-accent",
            isExpanded && "bg-accent"
          )}
          onClick={handleToggle}
          style={{ paddingLeft: `${indent + 8}px` }}
          title={node.path}
        >
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )}
          />
          <Folder className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{node.name}</span>
          {isLoadingChildren && (
            <span className="text-muted-foreground text-xs">
              <Loader2Icon className="size-4 animate-spin" />
            </span>
          )}
        </CollapsibleTrigger>
      </ItemContextMenu>
      <CollapsiblePanel>
        {children.map((child) => (
          <FileTreeItem
            gitStatus={gitStatus}
            key={child.path}
            level={level + 1}
            node={child}
            rootPath={rootPath}
          />
        ))}
      </CollapsiblePanel>
    </Collapsible>
  );
}

async function loadTreeRecursively(
  node: FileTreeNode,
  rootPath: string,
  gitStatus: Record<string, string>
): Promise<FileTreeNode> {
  if (!node.is_dir) {
    return node;
  }

  try {
    const entries = await invoke<DirectoryEntry[]>("list_directory", {
      path: node.path,
    });

    const childrenPromises = entries.map(async (entry) => {
      const entryRelativePath = normalizePath(entry.path, rootPath);
      const status = gitStatus[entryRelativePath] as GitStatus | undefined;

      const childNode: FileTreeNode = {
        ...entry,
        expanded: false,
        children: [],
        gitStatus: status || null,
      };

      if (entry.is_dir) {
        return await loadTreeRecursively(childNode, rootPath, gitStatus);
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

export function FileTree({
  rootPath,
  searchQuery = "",
}: {
  rootPath: string;
  searchQuery?: string;
}) {
  const [rootNode, setRootNode] = useState<FileTreeNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gitStatus, setGitStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadRoot = async () => {
      setIsLoading(true);
      try {
        const [entries, status] = await Promise.all([
          invoke<DirectoryEntry[]>("list_directory", {
            path: rootPath,
          }),
          invoke<Record<string, string>>("get_git_status", {
            repoPath: rootPath,
          }).catch(() => ({}) as Record<string, string>),
        ]);

        setGitStatus(status);

        const treeNodes: FileTreeNode[] = entries.map((entry) => {
          const entryRelativePath = normalizePath(entry.path, rootPath);
          const entryStatus = status[entryRelativePath] as
            | GitStatus
            | undefined;
          return {
            ...entry,
            expanded: false,
            children: [],
            gitStatus: entryStatus || null,
          };
        });

        const root: FileTreeNode = {
          name: rootPath.split(PATH_SEPARATOR_REGEX).at(-1) || rootPath,
          path: rootPath,
          is_dir: true,
          expanded: true,
          children: treeNodes,
          gitStatus: null,
        };

        if (searchQuery.trim()) {
          const fullyLoadedRoot = await loadTreeRecursively(
            root,
            rootPath,
            status
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
    <div className="select-none">
      {filteredRootNode.children?.map((child) => (
        <FileTreeItem
          gitStatus={gitStatus}
          key={child.path}
          node={child}
          rootPath={rootPath}
        />
      ))}
    </div>
  );
}

function ItemContextMenu({
  children,
  path,
  rootPath,
}: {
  children: React.ComponentProps<typeof ContextMenuTriggerComponent>["render"];
  path: string;
  rootPath: string;
}) {
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
