import { LazyStore } from "@tauri-apps/plugin-store";
import { create } from "zustand";

const tauriStore = new LazyStore(".settings.dat");

export const SETTINGS_KEYS = {
  appearance: {
    language: "appearance.language",
  },
  workspace: {
    clonePath: "workspace.clone_path",
  },
  editor: {
    gitBlame: {
      show: "editor.git_blame.show",
      extendedDetails: "editor.git_blame.extended_details",
    },
  },
} as const;

export type Settings = {
  appearance: {
    language: string;
  };
  workspace: {
    clonePath: string;
  };
  editor: {
    gitBlame: {
      show: boolean;
      extendedDetails: boolean;
    };
  };
};

const DEFAULT_SETTINGS: Settings = {
  appearance: {
    language: "en",
  },
  workspace: {
    clonePath: "",
  },
  editor: {
    gitBlame: {
      show: false,
      extendedDetails: false,
    },
  },
};

type SettingsState = {
  settings: Settings;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  updateAppearanceLanguage: (language: string) => Promise<void>;
  updateWorkspaceClonePath: (clonePath: string) => Promise<void>;
  updateEditorGitBlameShow: (show: boolean) => Promise<void>;
  updateEditorGitBlameExtendedDetails: (extendedDetails: boolean) => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) {
      return;
    }

    try {
      const [language, clonePath, gitBlameShow, gitBlameExtendedDetails] =
        await Promise.all([
          tauriStore.get<string>(SETTINGS_KEYS.appearance.language),
          tauriStore.get<string>(SETTINGS_KEYS.workspace.clonePath),
          tauriStore.get<boolean>(SETTINGS_KEYS.editor.gitBlame.show),
          tauriStore.get<boolean>(
            SETTINGS_KEYS.editor.gitBlame.extendedDetails
          ),
        ]);

      set({
        settings: {
          appearance: {
            language: language ?? DEFAULT_SETTINGS.appearance.language,
          },
          workspace: {
            clonePath: clonePath ?? DEFAULT_SETTINGS.workspace.clonePath,
          },
          editor: {
            gitBlame: {
              show: gitBlameShow ?? DEFAULT_SETTINGS.editor.gitBlame.show,
              extendedDetails:
                gitBlameExtendedDetails ??
                DEFAULT_SETTINGS.editor.gitBlame.extendedDetails,
            },
          },
        },
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Error loading settings:", error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  updateAppearanceLanguage: async (language: string) => {
    try {
      await tauriStore.set(SETTINGS_KEYS.appearance.language, language);
      await tauriStore.save();
      set((state) => ({
        settings: {
          ...state.settings,
          appearance: { ...state.settings.appearance, language },
        },
      }));
    } catch (error) {
      console.error("Error updating appearance.language:", error);
      throw error;
    }
  },

  updateWorkspaceClonePath: async (clonePath: string) => {
    try {
      await tauriStore.set(SETTINGS_KEYS.workspace.clonePath, clonePath);
      await tauriStore.save();
      set((state) => ({
        settings: {
          ...state.settings,
          workspace: { ...state.settings.workspace, clonePath },
        },
      }));
    } catch (error) {
      console.error("Error updating workspace.clonePath:", error);
      throw error;
    }
  },

  updateEditorGitBlameShow: async (show: boolean) => {
    try {
      await tauriStore.set(SETTINGS_KEYS.editor.gitBlame.show, show);
      await tauriStore.save();
      set((state) => ({
        settings: {
          ...state.settings,
          editor: {
            ...state.settings.editor,
            gitBlame: { ...state.settings.editor.gitBlame, show },
          },
        },
      }));
    } catch (error) {
      console.error("Error updating editor.gitBlame.show:", error);
      throw error;
    }
  },

  updateEditorGitBlameExtendedDetails: async (extendedDetails: boolean) => {
    try {
      await tauriStore.set(
        SETTINGS_KEYS.editor.gitBlame.extendedDetails,
        extendedDetails
      );
      await tauriStore.save();
      set((state) => ({
        settings: {
          ...state.settings,
          editor: {
            ...state.settings.editor,
            gitBlame: {
              ...state.settings.editor.gitBlame,
              extendedDetails,
            },
          },
        },
      }));
    } catch (error) {
      console.error("Error updating editor.gitBlame.extendedDetails:", error);
      throw error;
    }
  },
}));

