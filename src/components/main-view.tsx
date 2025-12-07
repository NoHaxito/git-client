import { FileViewer } from "@/components/file-viewer";
import { Button } from "@/components/ui/button";
import { useFileStore } from "@/stores/file";
import { useRepoStore } from "@/stores/repo";

export function MainView() {
  const clearRepo = useRepoStore((state) => state.clearRepo);
  const openFilePath = useFileStore((state) => state.openFilePath);

  if (openFilePath) {
    return <FileViewer />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Button onClick={clearRepo}>Close Repository</Button>
    </div>
  );
}
