import { invoke } from "@tauri-apps/api/core";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { DiffViewer } from "@/components/diff-viewer";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useRepoStore } from "@/stores/repo";

export default function ProjectFilesFilepathDiff() {
  const params = useParams();
  const splat = params["*"];
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!(splat && currentRepo)) {
      setIsLoading(false);
      return;
    }

    // Extract file path from URL: /project/files/diff/<path> -> <path>
    // The splat should be the file path directly
    const decodedPath = decodeURIComponent(splat);
    setIsLoading(true);

    invoke<string>("get_git_diff", {
      repoPath: currentRepo,
      filePath: decodedPath,
    })
      .then((diff) => {
        setFileContent(diff);
      })
      .catch((error) => {
        console.error("Error reading git diff:", error);
        invoke<string>("read_file", { path: decodedPath })
          .then((content) => {
            setFileContent(content);
          })
          .catch(() => {
            setFileContent(null);
          });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [splat, currentRepo]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading diff...</div>
      </div>
    );
  }

  if (!splat) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="text-muted-foreground text-sm">No file selected</div>
      </div>
    );
  }

  const decodedPath = decodeURIComponent(splat);

  if (!fileContent) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="text-muted-foreground text-sm">
          No diff available for this file
        </div>
      </div>
    );
  }
  const handleCloseFile = () => {
    navigate("/project/files");
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div className="flex flex-1">
            <DiffViewer diffContent={fileContent} filePath={decodedPath} />
          </div>
        }
      />
      <ContextMenuPopup>
        <ContextMenuItem onClick={handleCloseFile}>
          <XIcon className="size-4" />
          Close File
        </ContextMenuItem>
      </ContextMenuPopup>
    </ContextMenu>
  );
}
