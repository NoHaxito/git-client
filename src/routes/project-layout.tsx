import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { StatusBar } from "@/components/navigation/status-bar";
import { CustomTabs } from "@/components/tabs/custom-tabs";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useGitRemoteOrigin } from "@/hooks/tauri-queries";
import { useRepoStore } from "@/stores/repo";
import { useTabsStore } from "@/stores/tabs";

export default function ProjectLayout() {
  const location = useLocation();
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const setRemoteOrigin = useRepoStore((state) => state.setRemoteOrigin);
  const { data: remoteOrigin } = useGitRemoteOrigin(currentRepo);
  const addTab = useTabsStore((state) => state.addTab);
  const clearTabs = useTabsStore((state) => state.clearTabs);

  useEffect(() => {
    if (remoteOrigin !== undefined) {
      setRemoteOrigin(remoteOrigin);
    }
  }, [remoteOrigin, setRemoteOrigin]);

  useEffect(() => {
    if (!currentRepo) {
      clearTabs();
      return;
    }
  }, [currentRepo, clearTabs]);

  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.startsWith("/project/files/view/")) {
      const encodedPath = pathname.replace("/project/files/view/", "");
      const decodedPath = decodeURIComponent(encodedPath);
      addTab({
        type: "file",
        path: decodedPath,
      });
    } else if (pathname.startsWith("/project/files/diff/")) {
      const encodedPath = pathname.replace("/project/files/diff/", "");
      const decodedPath = decodeURIComponent(encodedPath);
      addTab({
        type: "diff",
        path: decodedPath,
      });
    }
  }, [location.pathname, addTab]);

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="flex h-screen w-full flex-1 flex-col overflow-hidden"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <StatusBar />
        <SidebarProvider
          className="min-h-[calc(100vh-2.5rem)]"
          style={
            {
              "--sidebar-width": "380.5px",
              "--header-height": "2.5rem",
            } as React.CSSProperties
          }
        >
          <AppSidebar />
          <SidebarInset className="m-2 flex max-h-[calc(100vh-var(--header-height))] flex-col overflow-y-scroll rounded-xl border dark:bg-zinc-900">
            <CustomTabs />
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </motion.div>
    </AnimatePresence>
  );
}
