import { useEffect } from "react";
import {
  SETTINGS_KEYS,
  useSettingsStore,
  type Settings,
} from "@/stores/settings";

export { SETTINGS_KEYS, type Settings };

export function useSettings() {
  const store = useSettingsStore();
  const { initialize, isInitialized } = store;

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return {
    settings: store.settings,
    isLoading: store.isLoading,
    updateAppearanceLanguage: store.updateAppearanceLanguage,
    updateWorkspaceClonePath: store.updateWorkspaceClonePath,
    updateEditorGitBlameShow: store.updateEditorGitBlameShow,
    updateEditorGitBlameExtendedDetails: store.updateEditorGitBlameExtendedDetails,
  };
}
