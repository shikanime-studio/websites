import type { FlagshipBinding } from "@cloudflare/flagship/server";
import type { BooleanFlags, ResolvedFlags } from "./index";
import { FlagshipServerProvider } from "@cloudflare/flagship/server";
import { OpenFeature } from "@openfeature/server-sdk";

export interface ResolveFlagsOptions<F extends BooleanFlags> {
  /** `env.FLAGS`; absent in tests and in Workers without the binding. */
  binding: FlagshipBinding | undefined;
  /** The app's registry, declared next to its fallbacks. */
  flags: F;
}

/** Declared fallbacks, in the shape the caller expects. */
export function fallbacks<F extends BooleanFlags>(
  flags: F,
): ResolvedFlags<F> {
  return Object.fromEntries(
    Object.entries(flags).map(([name, flag]) => [name, flag.fallback]),
  ) as ResolvedFlags<F>;
}

let providerReady: Promise<void> | undefined;

/**
 * Resolve every flag once, server-side.
 *
 * The provider is memoized per isolate: the Flagship binding authenticates
 * itself, so the first request pays for setup and the rest reuse it. A failed
 * setup, a missing binding, or an evaluation error all end in the declared
 * fallbacks — a flag outage must never take a page down.
 */
export async function resolveFlags<F extends BooleanFlags>({
  binding,
  flags,
}: ResolveFlagsOptions<F>): Promise<ResolvedFlags<F>> {
  if (!binding) {
    return fallbacks(flags);
  }
  providerReady ??= OpenFeature.setProviderAndWait(
    new FlagshipServerProvider({ binding }),
  ).catch(() => {});
  await providerReady;
  const client = OpenFeature.getClient();
  const entries = await Promise.all(
    Object.entries(flags).map(async ([name, flag]) => {
      try {
        return [name, await client.getBooleanValue(flag.key, flag.fallback)] as const;
      } catch {
        return [name, flag.fallback] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as ResolvedFlags<F>;
}
