import { LazyStore } from "@tauri-apps/plugin-store";
import { useCallback, useEffect, useState } from "react";

const store = new LazyStore(".settings.dat");

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

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [language, clonePath, gitBlameShow, gitBlameExtendedDetails] =
          await Promise.all([
            store.get<string>(SETTINGS_KEYS.appearance.language),
            store.get<string>(SETTINGS_KEYS.workspace.clonePath),
            store.get<boolean>(SETTINGS_KEYS.editor.gitBlame.show),
            store.get<boolean>(SETTINGS_KEYS.editor.gitBlame.extendedDetails),
          ]);

        setSettings({
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
        });
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateAppearanceLanguage = useCallback(async (language: string) => {
    try {
      await store.set(SETTINGS_KEYS.appearance.language, language);
      await store.save();
      setSettings((prev) => ({
        ...prev,
        appearance: { ...prev.appearance, language },
      }));
    } catch (error) {
      console.error("Error updating appearance.language:", error);
      throw error;
    }
  }, []);

  const updateWorkspaceClonePath = useCallback(async (clonePath: string) => {
    try {
      await store.set(SETTINGS_KEYS.workspace.clonePath, clonePath);
      await store.save();
      setSettings((prev) => ({
        ...prev,
        workspace: { ...prev.workspace, clonePath },
      }));
    } catch (error) {
      console.error("Error updating workspace.clonePath:", error);
      throw error;
    }
  }, []);

  const updateEditorGitBlameShow = useCallback(async (show: boolean) => {
    try {
      await store.set(SETTINGS_KEYS.editor.gitBlame.show, show);
      await store.save();
      setSettings((prev) => ({
        ...prev,
        editor: {
          ...prev.editor,
          gitBlame: { ...prev.editor.gitBlame, show },
        },
      }));
    } catch (error) {
      console.error("Error updating editor.gitBlame.show:", error);
      throw error;
    }
  }, []);

  const updateEditorGitBlameExtendedDetails = useCallback(
    async (extendedDetails: boolean) => {
      try {
        await store.set(
          SETTINGS_KEYS.editor.gitBlame.extendedDetails,
          extendedDetails
        );
        await store.save();
        setSettings((prev) => ({
          ...prev,
          editor: {
            ...prev.editor,
            gitBlame: { ...prev.editor.gitBlame, extendedDetails },
          },
        }));
      } catch (error) {
        console.error("Error updating editor.gitBlame.extendedDetails:", error);
        throw error;
      }
    },
    []
  );

  return {
    settings,
    isLoading,
    updateAppearanceLanguage,
    updateWorkspaceClonePath,
    updateEditorGitBlameShow,
    updateEditorGitBlameExtendedDetails,
  };
}
