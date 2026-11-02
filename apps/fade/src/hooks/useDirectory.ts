import { useToast } from "@astryxdesign/core/Toast";
import { useAtom, useAtomSet } from "@effect/atom-react";
import { useCallback } from "react";
import { pickDirectory } from "../lib/fs";
import { directoryHandleAtom } from "../lib/ui-atoms";

/**
 * React binding only: the picker and its outcomes live in lib/fs, the handle
 * lives in the graph. What stays here is the design-system part — the toast.
 */
export function useDirectory() {
  const toast = useToast();
  const handle = useAtom(directoryHandleAtom)[0];
  const setHandle = useAtomSet(directoryHandleAtom);
  const isSupported
    = typeof window !== "undefined" && "showDirectoryPicker" in window;

  const select = useCallback(async () => {
    const picked = await pickDirectory();
    if (picked.ok) {
      setHandle(picked.handle);
      return;
    }
    if (picked.reason === "aborted") return;
    if (picked.reason === "unsupported") {
      console.warn("Your browser does not support opening local directories.");
      return;
    }
    toast({
      body: "Failed to open that directory. Try a different one.",
      type: "error",
    });
  }, [setHandle, toast]);

  return { handle, select, isSupported };
}
