import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";

import { ThemeProvider } from "@/components/theme-provider";
import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { router } from "./router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <TooltipProvider delay={100}>
    <ThemeProvider defaultTheme="system">
      <QueryProvider>
        <ToastProvider>
          <AnchoredToastProvider>
            <RouterProvider router={router} />
          </AnchoredToastProvider>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  </TooltipProvider>
);
