import { XIcon } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { useFileStore } from "@/stores/file";
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

export function FileViewer() {
  const openFilePath = useFileStore((state) => state.openFilePath);
  const fileContent = useFileStore((state) => state.fileContent);

  if (!openFilePath) {
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
    useFileStore.setState({ openFilePath: null, fileContent: null });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div className="flex min-h-[calc(100vh-1.75rem)] w-full flex-1 overflow-x-scroll overflow-y-scroll bg-background" />
        }
      >
        <CodeEditor
          filePath={openFilePath}
          key={openFilePath}
          language={getFileName(openFilePath)}
          readOnly
          value={fileContent}
        />
      </ContextMenuTrigger>
      <ContextMenuPopup>
        <ContextMenuItem onClick={handleCloseFile}>
          <XIcon className="size-4" />
          Close File
        </ContextMenuItem>
      </ContextMenuPopup>
    </ContextMenu>
  );
}
