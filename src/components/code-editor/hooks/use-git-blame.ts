import { useGitBlame as useGitBlameQuery } from "@/hooks/tauri-queries";
import { useSettings } from "@/hooks/use-settings";
import { useRepoStore } from "@/stores/repo";
import type { BlameLine } from "../types";

export function useGitBlame(filePath: string | null | undefined) {
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const { settings } = useSettings();
  const isGitBlameEnabled = settings.editor.gitBlame.show;

  const { data: blameData = [] } = useGitBlameQuery(
    currentRepo,
    filePath || null,
    isGitBlameEnabled
  );

  if (!isGitBlameEnabled) {
    return null;
  }

  return blameData as BlameLine[];
}
