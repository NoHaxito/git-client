import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings";

// biome-ignore lint/performance/noBarrelFile: ...
export { SETTINGS_KEYS, type Settings } from "@/stores/settings";

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
    updateEditorGitBlameExtendedDetails:
      store.updateEditorGitBlameExtendedDetails,
    updateEditorMinimapShow: store.updateEditorMinimapShow,
  };
}
