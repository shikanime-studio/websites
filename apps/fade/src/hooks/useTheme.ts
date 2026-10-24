import type { Theme } from "../lib/db";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { settingsCollection } from "../lib/db";

export function useTheme() {
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
      settingsCollection.insert({ id: "theme", value: newTheme });
    }
  };

  return { theme: themeValue, setTheme };
}
