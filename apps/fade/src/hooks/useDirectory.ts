import { useToast } from "@astryxdesign/core/Toast";
import { useAtom, useAtomSet } from "@effect/atom-react";
import { Cause, Effect, Exit } from "effect";
import { useCallback } from "react";
import { directoryHandleAtom } from "../lib/ui-atoms";

export function useDirectory() {
  const toast = useToast();
  const handle = useAtom(directoryHandleAtom)[0];
  const setHandle = useAtomSet(directoryHandleAtom);
  const isSupported
    = typeof window !== "undefined" && "showDirectoryPicker" in window;

  const select = useCallback(async () => {
    if (!isSupported) {
      console.warn("Your browser does not support opening local directories.");
      return;
    }
    const exit = await Effect.runPromiseExit(
      Effect.tryPromise({
        try: () => window.showDirectoryPicker(),
        catch: (error) => error as Error,
      }),
    );
    if (Exit.isSuccess(exit)) {
      setHandle(exit.value);
      return;
    }
    const error = Cause.squash(exit.cause);
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }
    toast({
      body: "Failed to open that directory. Try a different one.",
      type: "error",
    });
  }, [isSupported, setHandle, toast]);

  return { handle, select, isSupported };
}
