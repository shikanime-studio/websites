import type { ReactNode } from "react";
import type { Theme } from "../lib/db";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { ThemeContext } from "../hooks/useTheme";
import { settingsCollection } from "../lib/db";

/**
 * Persists the user's light/dark preference. The DOM attribute itself is
 * owned by Astryx's <Theme mode={...}> — this provider only supplies the mode.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: theme } = useLiveQuery((q) =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, "theme"))
      .findOne(),
  );

  const themeValue = theme?.value as Theme | undefined;

  const setTheme = (newTheme?: Theme) => {
    if (!newTheme) {
      if (theme) {
        settingsCollection.delete("theme");
      }
      return;
    }

    if (theme) {
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

  return (
    <ThemeContext value={{ theme: themeValue, setTheme }}>
      {children}
    </ThemeContext>
  );
}
