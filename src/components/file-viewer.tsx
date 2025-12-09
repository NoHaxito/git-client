import { XIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { CodeEditor } from "@/components/code-editor";
import { useFileStore } from "@/stores/file";
import { useTabsStore } from "@/stores/tabs";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuTrigger,
} from "./ui/context-menu";

const PATH_SEPARATOR_REGEX = /[/\\]/;

function getFileName(path: string): string {
  const parts = path.split(PATH_SEPARATOR_REGEX);
  return parts.at(-1) || path;
}

type FileViewerProps = {
  filePath: string;
  fileContent: string | null;
};

export function FileViewer({ filePath, fileContent }: FileViewerProps) {
  const navigate = useNavigate();
  const removeTab = useTabsStore((state) => state.removeTab);
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);

  if (!filePath) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="text-muted-foreground text-sm">No file selected</div>
      </div>
    );
  }

  if (fileContent === null) {
    return (
      <div className="flex h-full flex-1 items-center justify-center px-4">
        <div className="text-muted-foreground text-sm">
          There was an error loading the file content, file not supported or not
          found
        </div>
      </div>
    );
  }

  const handleCloseFile = () => {
    const tabId = `file:${filePath}`;
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

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div className="flex flex-1">
            <CodeEditor
              filePath={filePath}
              key={filePath}
              language={getFileName(filePath)}
              readOnly
              value={fileContent}
            />
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
