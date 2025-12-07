import { LazyStore } from "@tauri-apps/plugin-store";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
const store = new LazyStore(".settings.dat");

function disableAnimation() {
  const css = document.createElement("style");
  css.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}"
    )
  );
  document.head.appendChild(css);
  return () => {
    (() => window.getComputedStyle(document.body))();
    setTimeout(() => {
      document.head.removeChild(css);
    }, 1);
  };
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "appearance.theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await store.get<Theme>(storageKey);
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const root = window.document.documentElement;
    const enableAnimation = disableAnimation();

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    enableAnimation();
  }, [theme, isLoaded]);

  const value = {
    theme,
    setTheme: async (themeValue: Theme) => {
      try {
        await store.set(storageKey, themeValue);
        await store.save();
        setTheme(themeValue);
      } catch (error) {
        console.error("Error saving theme:", error);
        setTheme(themeValue);
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
