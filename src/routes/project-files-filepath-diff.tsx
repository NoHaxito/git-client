import { XIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { DiffViewer } from "@/components/diff-viewer";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useGitDiff, useReadFile } from "@/hooks/tauri-queries";
import { useRepoStore } from "@/stores/repo";
import { useTabsStore } from "@/stores/tabs";

export default function ProjectFilesFilepathDiff() {
  const params = useParams();
  const splat = params["*"];
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const navigate = useNavigate();
  const decodedPath = splat ? decodeURIComponent(splat) : null;
  const removeTab = useTabsStore((state) => state.removeTab);
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);

  const {
    data: diffContent,
    isLoading: isLoadingDiff,
    error: diffError,
  } = useGitDiff(currentRepo, decodedPath);

  const { data: fileContent, isLoading: isLoadingFile } = useReadFile(
    diffError && decodedPath ? decodedPath : null
  );

  const isLoading = isLoadingDiff || (diffError && isLoadingFile);
  const content = diffContent || fileContent || null;

  const handleCloseFile = () => {
    if (!decodedPath) {
      navigate("/project/files");
      return;
    }
    const tabId = `diff:${decodedPath}`;
    const currentTabs = tabs;
    const willBeRemoved = activeTabId === tabId;
    removeTab(tabId);

    if (willBeRemoved && currentTabs.length > 1) {
      const currentIndex = currentTabs.findIndex((t) => t.id === tabId);
      const nextTab =
        currentIndex > 0
          ? currentTabs[currentIndex - 1]
          : currentTabs[currentIndex + 1];
      if (nextTab) {
        const encodedPath = encodeURIComponent(nextTab.path);
        if (nextTab.type === "diff") {
          navigate(`/project/files/diff/${encodedPath}`);
        } else {
          navigate(`/project/files/view/${encodedPath}`);
        }
      } else {
        navigate("/project/files");
      }
    } else if (willBeRemoved) {
      navigate("/project/files");
    }
  };

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

  if (!(decodedPath && content)) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="text-muted-foreground text-sm">No diff available</div>
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={<DiffViewer diffContent={content} filePath={decodedPath} />}
      />
      <ContextMenuPopup align="start">
        <ContextMenuItem onClick={handleCloseFile}>
          <XIcon className="size-4" />
          Close File
        </ContextMenuItem>
      </ContextMenuPopup>
    </ContextMenu>
  );
}
