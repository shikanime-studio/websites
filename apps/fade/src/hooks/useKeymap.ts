import type { Command } from "../lib/settings";
import { useAtomValue } from "@effect/atom-react";
import { keyFor, keymapsAtom } from "../lib/settings";
import { useKeydown } from "./useKeydown";

/** Which key triggers a command, and the DOM listener that fires it. */
export function useKeymap(command: Command, handler: () => void) {
  const keymaps = useAtomValue(keymapsAtom);
  const key = keyFor(keymaps, command);

  useKeydown((event) => {
    if (event.key === key) {
      event.preventDefault();
      handler();
    }
  });
}
