import type { ReactNode } from "react";
import type { Locale } from "../schema";
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { useAtomRefresh, useAtomValue } from "@effect/atom-react";
import { useEffect, useSyncExternalStore } from "react";
import {
  accountPreferences,
  currentLocale,
  preferencesAtom,
  resolveLocale,
} from "../lib/preferences";
import { CATALOGS } from "./messages";

const MESSAGES_BY_LOCALE = {
  en: CATALOGS.en,
  fr: CATALOGS.fr,
  ja: CATALOGS.ja,
};

function useLocale(): Locale {
  return useSyncExternalStore(
    currentLocale.subscribe,
    currentLocale.get,
    () => "en" as const,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const preferences = useAtomValue(preferencesAtom);
  const refreshPreferences = useAtomRefresh(preferencesAtom);

  // Account state landing (or sign-in/out refresh) re-resolves the locale.
  useEffect(() => {
    const prefs = accountPreferences(preferences);
    if (prefs !== undefined && resolveLocale(prefs) !== currentLocale.get()) {
      currentLocale.set(resolveLocale(prefs));
    }
  }, [preferences]);

  useEffect(() => {
    refreshPreferences();
  }, [refreshPreferences]);

  return (
    <InternationalizationProvider
      locale={locale}
      messages={MESSAGES_BY_LOCALE}
    >
      {children}
    </InternationalizationProvider>
  );
}
