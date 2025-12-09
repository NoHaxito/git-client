import { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";

import { ThemeProvider } from "@/components/theme-provider";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { useSettingsStore } from "@/stores/settings";
import { router } from "./router";

function SettingsInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useSettingsStore((state) => state.initialize);
  const isInitialized = useSettingsStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <TooltipProvider delay={100}>
    <ThemeProvider defaultTheme="system">
      <QueryProvider>
        <SettingsInitializer>
          <ToastProvider>
            <AnchoredToastProvider>
              <RouterProvider router={router} />
            </AnchoredToastProvider>
          </ToastProvider>
        </SettingsInitializer>
      </QueryProvider>
    </ThemeProvider>
  </TooltipProvider>
);
