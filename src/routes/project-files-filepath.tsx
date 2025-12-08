import { useParams } from "react-router";
import { FileViewer } from "@/components/file-viewer";
import { useReadFile } from "@/hooks/tauri-queries";

export default function ProjectFilesFilepath() {
  const params = useParams();
  const splat = params["*"];
  const decodedPath = splat ? decodeURIComponent(splat) : null;
  const { data: fileContent, isLoading } = useReadFile(decodedPath);

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading file...</div>
      </div>
    );
  }

  if (!splat || !decodedPath) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="text-muted-foreground text-sm">No file selected</div>
      </div>
    );
  }

  return <FileViewer filePath={decodedPath} fileContent={fileContent || null} />;
}

