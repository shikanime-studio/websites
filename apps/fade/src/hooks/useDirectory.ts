import { useAtom, useAtomSet } from "@effect/atom-react";
import { useCallback } from "react";
import { directoryHandleAtom } from "../lib/ui-atoms";

export function useDirectory() {
  const handle = useAtom(directoryHandleAtom)[0];
  const setHandle = useAtomSet(directoryHandleAtom);
  const isSupported
    = typeof window !== "undefined" && "showDirectoryPicker" in window;

  const select = useCallback(async () => {
    try {
      if (!isSupported) {
        console.warn(
          "Your browser does not support opening local directories.",
        );
        return;
      }
      const dirHandle = await window.showDirectoryPicker();
      setHandle(dirHandle);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error(
          "Failed to open directory. Please try again or choose a different one.",
        );
      }
    }
  }, [isSupported, setHandle]);

  return { handle, select, isSupported };
}
