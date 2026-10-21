import type { AsyncResult } from "effect/reactivity/AsyncResult";
import type { Atom } from "effect/reactivity/Atom";
import { useToast } from "@astryxdesign/core/Toast";
import { useAtomValue } from "@effect/atom-react";
import { isFailure } from "effect/reactivity/AsyncResult";
import { useEffect } from "react";
import { showToast } from "../components/Toast";

/** Reads a result atom, toasting once per failure. */
export function useCardResult<A, E>(
  atom: Atom<AsyncResult<Array<A>, E>>,
  message = "Failed to load content",
): AsyncResult<Array<A>, E> {
  const result = useAtomValue(atom);
  const toast = showToast(useToast());
  useEffect(() => {
    if (isFailure(result)) {
      toast(message);
    }
  }, [result, toast, message]);
  return result;
}
