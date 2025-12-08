import { useRepoStore } from "@/stores/repo";
import { useGitBlame as useGitBlameQuery } from "@/hooks/tauri-queries";
import type { BlameLine } from "../types";

export function useGitBlame(filePath: string | null | undefined) {
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const { data: blameData = [] } = useGitBlameQuery(currentRepo, filePath || null);

  return blameData as BlameLine[];
}
