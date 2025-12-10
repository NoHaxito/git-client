/** biome-ignore-all lint/a11y/useKeyWithClickEvents: cant nest buttons inside buttons */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: cant nest buttons inside buttons */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: cant nest buttons inside buttons */
import { DiffIcon, GitCompareIcon, XIcon } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { getFileIcon } from "@/components/file-tree/file-icon";
import { cn } from "@/lib/utils";
import { type Tab, useTabsStore } from "@/stores/tabs";
import { Button } from "../ui/button";

export function CustomTabs() {
  const navigate = useNavigate();
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const setActiveTab = useTabsStore((state) => state.setActiveTab);
  const removeTab = useTabsStore((state) => state.removeTab);

  const handleTabClick = useCallback(
    (tab: Tab) => {
      setActiveTab(tab.id);
      const encodedPath = encodeURIComponent(tab.path);
      if (tab.type === "diff") {
        navigate(`/project/files/diff/${encodedPath}`);
      } else {
        navigate(`/project/files/view/${encodedPath}`);
      }
    },
    [navigate, setActiveTab]
  );

  const handleOpenDiffForCurrentFile = useCallback(() => {
    const currentTab = tabs.find((t) => t.id === activeTabId);
    if (currentTab) {
      navigate(`/project/files/diff/${encodeURIComponent(currentTab.path)}`);
    }
  }, [navigate, tabs, activeTabId]);

  const handleCloseTab = useCallback(
    (e: React.MouseEvent, tab: Tab) => {
      e.stopPropagation();
      const { tabs: currentTabs, activeTabId: currentActiveId } =
        useTabsStore.getState();
      const willBeRemoved = currentActiveId === tab.id;
      removeTab(tab.id);

      if (willBeRemoved && currentTabs.length > 1) {
        const currentIndex = currentTabs.findIndex((t) => t.id === tab.id);
        const nextTab =
          currentIndex > 0
            ? currentTabs[currentIndex - 1]
            : currentTabs[currentIndex + 1];
        if (nextTab) {
          handleTabClick(nextTab);
        } else {
          navigate("/project/files");
        }
      } else if (willBeRemoved) {
        navigate("/project/files");
      }
    },
    [navigate, removeTab, handleTabClick]
  );

  if (tabs.length === 0) {
    return (
      <div className="sticky top-0 z-20 h-8 bg-background dark:bg-zinc-900" />
    );
  }

  return (
    <div className="sticky top-0 z-20 flex h-8 min-h-8 items-center overflow-hidden border-b bg-background dark:bg-zinc-900">
      <div className="flex flex-1 shrink-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const FileIcon =
            tab.type === "diff" ? DiffIcon : getFileIcon(tab.path);
          return (
            <button
              className={cn(
                "group flex h-8 items-center gap-1.5 px-2 text-xs transition-colors",
                "border-transparent border-t hover:bg-accent/50",
                isActive &&
                  "border-b-background bg-background dark:border-b-sidebar dark:bg-sidebar-accent/50"
              )}
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              type="button"
            >
              <FileIcon
                className={cn(
                  "size-4 shrink-0",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "max-w-[200px] truncate",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </span>
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded opacity-0 transition-opacity",
                  "hover:bg-sidebar-accent group-hover:opacity-100",
                  isActive && "opacity-100"
                )}
                onClick={(e) => handleCloseTab(e, tab)}
              >
                <XIcon className="size-3" />
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2 px-4">
        <Button
          onClick={handleOpenDiffForCurrentFile}
          size="icon-sm"
          variant="ghost"
        >
          <GitCompareIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
