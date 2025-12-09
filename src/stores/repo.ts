import { create } from "zustand";
import { persist } from "zustand/middleware";

type RepoState = {
  currentRepo: string | null;
  currentBranch: string | null;
  remoteOrigin: string | null;
  setRepo: (path: string) => void;
  setBranch: (branch: string | null) => void;
  setRemoteOrigin: (origin: string | null) => void;
  clearRepo: () => void;
};

export const useRepoStore = create<RepoState>()(
  persist(
    (set) => ({
      currentRepo: null,
      currentBranch: null,
      remoteOrigin: null,
      setRepo: (path) => set({ currentRepo: path, currentBranch: null, remoteOrigin: null }),
      setBranch: (branch) => set({ currentBranch: branch }),
      setRemoteOrigin: (origin) => set({ remoteOrigin: origin }),
      clearRepo: () => set({ currentRepo: null, currentBranch: null, remoteOrigin: null }),
    }),
    {
      name: "repo-storage",
    }
  )
);
