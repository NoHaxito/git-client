import { create } from "zustand";
import { persist } from "zustand/middleware";

type RepoState = {
  currentRepo: string | null;
  currentBranch: string | null;
  setRepo: (path: string) => void;
  setBranch: (branch: string | null) => void;
  clearRepo: () => void;
};

export const useRepoStore = create<RepoState>()(
  persist(
    (set) => ({
      currentRepo: null,
      currentBranch: null,
      setRepo: (path) => set({ currentRepo: path, currentBranch: null }),
      setBranch: (branch) => set({ currentBranch: branch }),
      clearRepo: () => set({ currentRepo: null, currentBranch: null }),
    }),
    {
      name: "repo-storage",
    }
  )
);
