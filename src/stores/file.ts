import { create } from "zustand";

type FileState = {
  openFilePath: string | null;
  fileContent: string | null;
  isLoading: boolean;
  setOpenFile: (path: string | null) => void;
  setFileContent: (content: string | null) => void;
  setIsLoading: (loading: boolean) => void;
};

export const useFileStore = create<FileState>((set) => ({
  openFilePath: null,
  fileContent: null,
  isLoading: false,
  setOpenFile: (path) => set({ openFilePath: path }),
  setFileContent: (content) => set({ fileContent: content }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
