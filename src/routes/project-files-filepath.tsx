import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { FileViewer } from "@/components/file-viewer";

export default function ProjectFilesFilepath() {
  const params = useParams();
  const splat = params["*"];
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!splat) {
      setIsLoading(false);
      return;
    }

    const decodedPath = decodeURIComponent(splat);
    setIsLoading(true);

    invoke<string>("read_file", { path: decodedPath })
      .then((content) => {
        setFileContent(content);
      })
      .catch((error) => {
        console.error("Error reading file:", error);
        setFileContent(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [splat]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading file...</div>
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
  return <FileViewer filePath={decodedPath} fileContent={fileContent} />;
}

