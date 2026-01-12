import { eq, useLiveQuery } from "@tanstack/react-db";
import { useEffect } from "react";
import { settingsCollection } from "../lib/db";
import { ThemeContext } from "../hooks/useTheme";
import type { Theme } from "../lib/db";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useLiveQuery((q) =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, "theme"))
      .findOne(),
  );

  const theme = (data?.value as Theme | undefined) ?? "system";

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
      return () => {
        mediaQuery.removeEventListener("change", applySystemTheme);
      };
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (data) {
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
