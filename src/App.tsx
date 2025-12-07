import { AnimatePresence, motion } from "motion/react";
import { EmptyWorkspace } from "@/components/empty-workspace";
import { MainView } from "@/components/main-view";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { StatusBar } from "@/components/navigation/status-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useRepoStore } from "@/stores/repo";

export function App() {
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const IS_EMPTY_WORKSPACE = !currentRepo;
  return (
    <>
      <AnimatePresence>
        {IS_EMPTY_WORKSPACE && (
          <motion.div
            animate={{ opacity: 1 }}
            className="h-screen w-screen overflow-hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <EmptyWorkspace />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!IS_EMPTY_WORKSPACE && (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex h-screen w-full flex-1 flex-col overflow-hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SidebarProvider
              className="min-h-[calc(100vh-1.75rem)]"
              style={
                {
                  "--sidebar-width": "380.5px",
                } as React.CSSProperties
              }
            >
              <AppSidebar />
              <SidebarInset className="flex min-h-[calc(100vh-1.75rem)] flex-col bg-sidebar/50">
                <MainView />
              </SidebarInset>
            </SidebarProvider>
            <StatusBar />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
