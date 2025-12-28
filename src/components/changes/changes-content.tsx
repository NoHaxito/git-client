import { CheckIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { getFileIcon } from "@/components/file-tree/file-icon";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import {
  useCommitChanges,
  useGitStatus,
  useStageFile,
  useUnstageFile,
} from "@/hooks/tauri-queries";

type FileChange = {
  path: string;
  status: string;
  isStaged: boolean;
};

function parseGitStatus(gitStatus: Record<string, string>): {
  staged: FileChange[];
  unstaged: FileChange[];
} {
  const staged: FileChange[] = [];
  const unstaged: FileChange[] = [];

  for (const [filePath, status] of Object.entries(gitStatus)) {
    const isStaged =
      status === "added" ||
      status === "modified-staged" ||
      status === "added-modified" ||
      status === "added-deleted" ||
      status === "deleted" ||
      status === "renamed" ||
      status === "copied";
    const change: FileChange = {
      path: filePath,
      status,
      isStaged,
    };

    if (isStaged) {
      staged.push(change);
    } else {
      unstaged.push(change);
    }
  }

  staged.sort((a, b) => a.path.localeCompare(b.path));
  unstaged.sort((a, b) => a.path.localeCompare(b.path));

  return { staged, unstaged };
}

export function ChangesContent({ repoPath }: { repoPath: string }) {
  const navigate = useNavigate();
  const { data: gitStatus = {}, isLoading } = useGitStatus(repoPath);
  const stageMutation = useStageFile();
  const unstageMutation = useUnstageFile();
  const commitMutation = useCommitChanges();
  const [commitMessage, setCommitMessage] = useState("");

  const { staged, unstaged } = parseGitStatus(gitStatus);
  const hasStagedFiles = staged.length > 0;

  const handleStage = async (filePath: string) => {
    try {
      await stageMutation.mutateAsync({
        repoPath,
        filePath,
      });
    } catch (error) {
      console.error("Error staging file:", error);
    }
  };

  const handleUnstage = async (filePath: string) => {
    try {
      await unstageMutation.mutateAsync({
        repoPath,
        filePath,
      });
    } catch (error) {
      console.error("Error unstaging file:", error);
    }
  };

  const handleCommit = async () => {
    if (!(commitMessage.trim() && hasStagedFiles)) {
      return;
    }
    try {
      await commitMutation.mutateAsync({
        repoPath,
        message: commitMessage.trim(),
      });
      setCommitMessage("");
    } catch (error) {
      console.error("Error committing changes:", error);
    }
  };

  const handleFileClick = (filePath: string) => {
    const encodedPath = encodeURIComponent(filePath);
    navigate(`/project/files/view/${encodedPath}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {hasStagedFiles && (
          <SidebarGroup className="p-0">
            <SidebarGroupLabel>Staged Changes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {staged.map((change) => {
                  const fileName = change.path.split("/").pop() || change.path;
                  const FileIcon = getFileIcon(fileName);
                  return (
                    <SidebarMenuItem key={change.path}>
                      <SidebarMenuButton
                        onClick={() => handleFileClick(change.path)}
                        size="sm"
                      >
                        <FileIcon className="size-4 shrink-0" />
                        <span className="min-w-0 truncate">{change.path}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        onClick={() => handleUnstage(change.path)}
                        showOnHover
                      >
                        <MinusIcon />
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {unstaged.length > 0 && (
          <SidebarGroup className="p-0">
            <SidebarGroupLabel>Changes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {unstaged.map((change) => {
                  const fileName = change.path.split("/").pop() || change.path;
                  const FileIcon = getFileIcon(fileName);
                  return (
                    <SidebarMenuItem key={change.path}>
                      <SidebarMenuButton
                        onClick={() => handleFileClick(change.path)}
                        size="sm"
                      >
                        <FileIcon className="size-4 shrink-0" />
                        <span className="min-w-0 truncate">{change.path}</span>
                      </SidebarMenuButton>
                      <SidebarMenuAction
                        onClick={() => handleStage(change.path)}
                        showOnHover
                      >
                        <PlusIcon />
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {staged.length === 0 && unstaged.length === 0 && (
          <div className="flex items-center justify-center p-4">
            <p className="text-muted-foreground text-sm">No changes detected</p>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="space-y-3">
          <Textarea
            className="min-h-20 resize-none"
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message..."
            value={commitMessage}
          />
          <Button
            className="w-full"
            disabled={!commitMessage.trim() || commitMutation.isPending}
            onClick={handleCommit}
          >
            {commitMutation.isPending ? (
              "Committing..."
            ) : (
              <>
                <CheckIcon className="mr-2 size-4" />
                Commit Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
