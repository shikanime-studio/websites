/**
 * Shared types for studio feature flags.
 *
 * Importing this entry is safe in a client bundle: it carries no runtime code
 * and no Cloudflare or OpenFeature dependency. The provider wiring lives in
 * `@shikanime-studio/flags/server`, which apps import from inside a server
 * function only.
 */

/** A boolean flag and the value to serve when Flagship cannot answer. */
export interface BooleanFlag {
  key: string;
  fallback: boolean;
}

/** The registry an app declares: local name → FlagShip key + fallback. */
export type BooleanFlags = Record<string, BooleanFlag>;

/** What an app gets back: the same local names, resolved to booleans. */
export type ResolvedFlags<F extends BooleanFlags> = Record<keyof F, boolean>;
