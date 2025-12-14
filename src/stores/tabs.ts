import { create } from "zustand";

export type TabType = "file" | "diff";

export type Tab = {
  id: string;
  type: TabType;
  path: string;
  label: string;
};

type AddTabInput = {
  type: TabType;
  path: string;
  label?: string;
};

type TabsState = {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: AddTabInput) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  clearTabs: () => void;
};

function getTabId(path: string, type: TabType): string {
  return `${type}:${path}`;
}

function getTabLabel(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts.at(-1) || path;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  addTab: (tab) => {
    const id = getTabId(tab.path, tab.type);
    const existingTabs = get().tabs;
    const existingTab = existingTabs.find((t) => t.id === id);

    if (existingTab) {
      set({ activeTabId: id });
      return;
    }

    const newTab: Tab = {
      id,
      ...tab,
      label: tab.label || getTabLabel(tab.path),
    };

    set({
      tabs: [...existingTabs, newTab],
      activeTabId: id,
    });
  },
  removeTab: (id) => {
    const { tabs, activeTabId } = get();
    const newTabs = tabs.filter((t) => t.id !== id);

    if (newTabs.length === 0) {
      set({ tabs: newTabs, activeTabId: null });
      return;
    }

    let newActiveTabId = activeTabId;
    if (activeTabId === id) {
      const currentIndex = tabs.findIndex((t) => t.id === id);
      if (currentIndex > 0) {
        newActiveTabId = tabs[currentIndex - 1].id;
      } else {
        newActiveTabId = newTabs[0].id;
      }
    }

    set({ tabs: newTabs, activeTabId: newActiveTabId });
  },
  setActiveTab: (id) => {
    set({ activeTabId: id });
  },
  clearTabs: () => {
    set({ tabs: [], activeTabId: null });
  },
}));
