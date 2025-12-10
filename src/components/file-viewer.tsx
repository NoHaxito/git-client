import { XIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { CodeEditor } from "@/components/code-editor";
import { type Tab, useTabsStore } from "@/stores/tabs";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuTrigger,
} from "./ui/context-menu";

const PATH_SEPARATOR_REGEX = /[/\\]/;

function getFileExtension(path: string): string {
  const parts = path.split(PATH_SEPARATOR_REGEX);
  return parts.at(-1)?.split(".").at(-1) || "";
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
    const currentIndex = tabs.findIndex((t) => t.id === tabId);
    const isActiveTab = activeTabId === tabId;

    let nextTab: Tab | undefined;
    if (isActiveTab && tabs.length > 1) {
      nextTab =
        currentIndex > 0 ? tabs[currentIndex - 1] : tabs[currentIndex + 1];
    }

    removeTab(tabId);

    if (nextTab) {
      const encodedPath = encodeURIComponent(nextTab.path);
      const route =
        nextTab.type === "diff"
          ? `/project/files/diff/${encodedPath}`
          : `/project/files/view/${encodedPath}`;
      navigate(route);
    } else if (isActiveTab) {
      navigate("/project/files");
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div className="flex flex-1 overflow-auto">
            <CodeEditor
              filePath={filePath}
              key={filePath}
              language={getFileExtension(filePath)}
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
