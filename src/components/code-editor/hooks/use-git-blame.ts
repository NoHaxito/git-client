import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useRepoStore } from "@/stores/repo";
import type { BlameLine } from "../types";

export function useGitBlame(filePath: string | null | undefined) {
  const [blameData, setBlameData] = useState<BlameLine[]>([]);
  const currentRepo = useRepoStore((state) => state.currentRepo);

  useEffect(() => {
    if (!filePath) {
      setBlameData([]);
      return;
    }

    if (!currentRepo) {
      setBlameData([]);
      return;
    }

    const loadBlame = async () => {
      try {
        const blame = await invoke<BlameLine[]>("get_git_blame", {
          repoPath: currentRepo,
          filePath,
        });
        setBlameData(blame);
      } catch (err) {
        console.error("Error loading git blame:", err);
        setBlameData([]);
      }
    };

    loadBlame();
  }, [filePath, currentRepo]);

  return blameData;
}
