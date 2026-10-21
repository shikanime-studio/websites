import type {AsyncResult} from "effect/reactivity/AsyncResult";
import type { Locale } from "../schema";
import type {UserPreferencesResponse} from "./api";
import { Effect, Schema } from "effect";
import {  isSuccess } from "effect/reactivity/AsyncResult";
import { make } from "effect/reactivity/Atom";
import {
  ApiError,
  fetchUserPreferences,
  saveUserPreferences
  
} from "./api";

const STORAGE_KEY = "hikari:lang";

const StoredLanguage = Schema.Literals(["en", "fr", "ja"] as const);

const decodeLocale = Schema.decodeUnknownOption(StoredLanguage);

/** Priority chain: account > browser (localStorage) > system (navigator). */
export interface Preferences {
  accountLocale: Locale | null;
}

function systemLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }
  const decoded = decodeLocale(window.navigator.language.slice(0, 2));
  return decoded._tag === "Some" ? decoded.value : "en";
}

function browserLocale(): Locale | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return undefined;
  }
  const decoded = decodeLocale(stored);
  return decoded._tag === "Some" ? decoded.value : undefined;
}

const loadAccount: Effect.Effect<UserPreferencesResponse | null, never> =
  Effect.catchIf(
    fetchUserPreferences,
    (error): error is ApiError => error instanceof ApiError,
    () => Effect.succeed(null),
  );

/** Global preferences state; the account slice is unknown while loading. */
export const preferencesAtom = make(loadAccount);

/** Unwraps the atom's AsyncResult once settled; undefined while loading/failed. */
export function accountPreferences(
  result: AsyncResult<UserPreferencesResponse | undefined, ApiError>,
): Preferences | undefined {
  if (!isSuccess(result)) {
    return undefined;
  }
  const prefs: UserPreferencesResponse | undefined = result.value;
  if (prefs === undefined || prefs === null) {
    return undefined;
  }
  if (prefs.locale === null) {
    return { accountLocale: null };
  }
  const decoded = decodeLocale(prefs.locale);
  return decoded._tag === "Some"
    ? { accountLocale: decoded.value }
    : undefined;
}

/** Current locale resolved from the global state. */
export function resolveLocale(prefs: Preferences): Locale {
  return prefs.accountLocale ?? browserLocale() ?? systemLocale();
}

/** Persist a locale change to every store the user has. */
export function saveLocale(next: Locale): void {
  window.localStorage.setItem(STORAGE_KEY, next);
  void Effect.runPromise(
    Effect.as(saveUserPreferences({ locale: next }), undefined),
  ).catch(() => {});
}

let activeLocale: Locale = "en";

const localeListeners = new Set<(locale: Locale) => void>();

/** Module-level locale: synchronous initial value, subscription for updates. */
export const currentLocale = {
  get: (): Locale => activeLocale,
  set(next: Locale): void {
    activeLocale = next;
    document.documentElement.lang = next;
    for (const listener of localeListeners) {
      listener(next);
    }
  },
  subscribe(listener: (locale: Locale) => void): () => void {
    localeListeners.add(listener);
    return () => localeListeners.delete(listener);
  },
};

// Synchronous initial resolve; satisfies useSyncExternalStore getSnapshot.
currentLocale.set(resolveLocale({ accountLocale: null }));
