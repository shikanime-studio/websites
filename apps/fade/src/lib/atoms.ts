import type { AsyncResult } from "effect/reactivity/AsyncResult";
import type { Atom } from "effect/reactivity/Atom";
import { Effect } from "effect";
import { make } from "effect/reactivity/Atom";

type Result<A> = AsyncResult<A, null>;

const roots = new WeakMap<object, Map<string, Atom<Result<unknown>>>>();
const derived = new WeakMap<object, Map<string, Atom<unknown>>>();

/** One derived atom per object identity and namespace. */
export function cachedAtom<A>(
  key: object | null,
  namespace: string,
  build: () => Atom<A>,
  fallback: Atom<A>,
): Atom<A> {
  if (!key) return fallback;
  let byNamespace = derived.get(key);
  if (!byNamespace) {
    byNamespace = new Map();
    derived.set(key, byNamespace);
  }
  let atom = byNamespace.get(namespace) as Atom<A> | undefined;
  if (!atom) {
    atom = build();
    byNamespace.set(namespace, atom);
  }
  return atom;
}

/**
 * Stable atom per object identity: GPU adapters, files and directory handles
 * are the cache keys, so a component that re-renders reuses the same result.
 */
export function queryAtom<A>(
  namespace: string,
  keys: object[],
  run: () => Promise<A>,
): Atom<Result<A>> {
  const primary = keys[0];
  if (!primary) {
    throw new Error("queryAtom needs at least one key");
  }
  let byNamespace = roots.get(primary);
  if (!byNamespace) {
    byNamespace = new Map();
    roots.set(primary, byNamespace);
  }
  const id = keys.length > 1 ? `${namespace}` : namespace;
  let atom = byNamespace.get(id);
  if (!atom) {
    atom = make(
      Effect.tryPromise({
        try: run,
        catch: () => null,
      }),
    ) as Atom<Result<unknown>>;
    byNamespace.set(id, atom);
  }
  return atom as Atom<Result<A>>;
}

export const emptyAtom: Atom<Result<null>> = make(Effect.succeed(null));

export function nullableAtom<A>(
  key: object | null,
  namespace: string,
  run: () => Promise<A | null>,
): Atom<Result<A | null>> {
  if (!key) {
    return emptyAtom as Atom<Result<A | null>>;
  }
  return queryAtom<A | null>(namespace, [key], run) as Atom<Result<A | null>>;
}
