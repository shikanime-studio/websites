import type { Theme } from "../lib/settings";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { useCallback } from "react";
import { settingActionAtom, settingsAtom } from "../lib/settings";

/**
 * React binding only: the preference lives in the settings atom, which also
 * owns persistence. The hook keeps the `{ theme, setTheme }` shape the modal
 * already uses.
 */
export function useTheme() {
  const theme = useAtomValue(settingsAtom).theme;
  const dispatch = useAtomSet(settingActionAtom);

  const setTheme = useCallback(
    (next?: Theme) => {
      dispatch({ _tag: "set", id: "theme", value: next });
    },
    [dispatch],
  );

  return { theme, setTheme };
}
