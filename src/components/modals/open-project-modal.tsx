import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { LazyStore } from "@tauri-apps/plugin-store";
import { FolderOpen, GitBranch } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toastManager } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useRepoStore } from "@/stores/repo";

const CLONE_PATH_KEY = "workspace.clone_path";
const store = new LazyStore(".settings.dat");
const PATH_SEPARATOR_REGEX = /[/\\]/;

export function OpenProjectModal() {
  const [openDialog, setOpenDialog] = useState(false);
  const [repos, setRepos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clonePath, setClonePath] = useState<string | null>(null);
  const setRepo = useRepoStore((state) => state.setRepo);

  const loadRepos = useCallback(async (path: string) => {
    setIsLoading(true);
    try {
      const reposList = await invoke<string[]>("list_git_repos", {
        clonePath: path,
      });
      setRepos(reposList);
    } catch (error) {
      console.error("Error loading repos:", error);
      setRepos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadClonePath = async () => {
      try {
        const savedPath = await store.get<string>(CLONE_PATH_KEY);
        if (savedPath) {
          setClonePath(savedPath);
          await loadRepos(savedPath);
        }
      } catch (error) {
        console.error("Error loading clone path:", error);
      }
    };
    loadClonePath();
  }, [loadRepos]);

  useEffect(() => {
    if (openDialog && clonePath) {
      loadRepos(clonePath);
    }
  }, [openDialog, clonePath, loadRepos]);

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected && typeof selected === "string") {
        await handleOpenProject(selected);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  };

  const handleOpenProject = async (path: string) => {
    try {
      const isGitRepo = await invoke<boolean>("is_git_repo", { path });
      if (!isGitRepo) {
        toastManager.add({
          type: "error",
          title: "Invalid Git Repository",
          description: "The selected folder does not contain a .git directory.",
        });
        return;
      }
      setRepo(path);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error opening project:", error);
      toastManager.add({
        type: "error",
        title: "Error",
        description: "Failed to open project. Please try again.",
      });
    }
  };

  const getRepoName = (path: string) => {
    const parts = path.split(PATH_SEPARATOR_REGEX);
    return parts.at(-1) || path;
  };

  const renderReposList = () => {
    if (isLoading) {
      return (
        <div className="text-muted-foreground text-sm">Loading projects...</div>
      );
    }

    if (repos.length === 0) {
      return (
        <div className="text-muted-foreground text-sm">
          No Git repositories found in the clone directory.
        </div>
      );
    }

    return (
      <ScrollArea className="max-h-64 rounded-lg border">
        <div className="p-2">
          {repos.map((repo) => (
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              )}
              key={repo}
              onClick={() => handleOpenProject(repo)}
              type="button"
            >
              <GitBranch className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">
                {getRepoName(repo)}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog onOpenChange={setOpenDialog} open={openDialog}>
      <DialogTrigger render={<Button />}>Open Project</DialogTrigger>
      <DialogPopup className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Open Project</DialogTitle>
          <DialogDescription>
            Select a Git repository to open or choose a folder from your
            computer.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div className="space-y-4">
            {clonePath && (
              <div className="space-y-2">
                <div className="font-medium text-muted-foreground text-sm">
                  Recent Projects
                </div>
                {renderReposList()}
              </div>
            )}
            {!clonePath && (
              <div className="text-muted-foreground text-sm">
                Configure a clone directory in settings to see recent projects.
              </div>
            )}
          </div>
        </DialogPanel>
        <DialogFooter>
          <Button onClick={handleSelectFolder} variant="outline">
            <FolderOpen className="mr-2 size-4" />
            Select Folder
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
