import { useAtomValue } from "@effect/atom-react";
import { getOrElse, isInitial } from "effect/reactivity/AsyncResult";
import { sessionAtom } from "../lib/atoms";

export type { SessionData, SessionUser } from "../lib/atoms";

/** Same shape the screens already consume: `{ data, isLoading }`. */
export function useSession() {
  const result = useAtomValue(sessionAtom);
  return {
    data: getOrElse(result, () => null),
    isLoading: isInitial(result),
  };
}
