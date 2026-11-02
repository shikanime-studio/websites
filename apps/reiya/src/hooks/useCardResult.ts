import type { AsyncResult } from "effect/reactivity/AsyncResult";
import type { Atom } from "effect/reactivity/Atom";
import { useToast } from "@astryxdesign/core/Toast";
import { useAtomValue } from "@effect/atom-react";
import { isFailure } from "effect/reactivity/AsyncResult";
import { useEffect } from "react";

/** Reads a result atom, toasting once per failure. */
export function useCardResult<A, E>(
  atom: Atom<AsyncResult<Array<A>, E>>,
  message = "Failed to load content",
): AsyncResult<Array<A>, E> {
  const result = useAtomValue(atom);
  const toast = useToast();
  useEffect(() => {
    if (isFailure(result)) {
      toast({ body: message, type: "error" });
    }
  }, [result, toast, message]);
  return result;
}
