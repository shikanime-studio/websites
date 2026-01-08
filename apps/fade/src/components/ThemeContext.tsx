import { eq, useLiveQuery } from "@tanstack/react-db";
import { createContext, useContext, useEffect } from "react";
import { settingsCollection } from "../lib/db";
import type { Theme } from "../lib/db";
import type { ReactNode } from "react";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useLiveQuery((q) =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, "theme")),
  );

  const theme = (data[0]?.value as Theme | undefined) ?? "system";

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystemTheme = () => {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        root.setAttribute("data-theme", systemTheme);
      };

      applySystemTheme();
      mediaQuery.addEventListener("change", applySystemTheme);
      return () => mediaQuery.removeEventListener("change", applySystemTheme);
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (data.length > 0) {
      settingsCollection.update("theme", (draft) => {
        draft.value = newTheme;
      });
    } else {
      settingsCollection.insert({
        id: "theme",
        value: newTheme,
      });
    }
  };

  const toggleTheme = () => {
    const nextTheme =
      theme === "system" ? "dark" : theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
