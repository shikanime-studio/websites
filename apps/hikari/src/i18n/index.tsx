import type { ReactNode } from "react";
import type { LanguageCode } from "./messages";
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { Schema } from "effect";
import { useCallback, useEffect, useState } from "react";
import { I18nContext } from "./context";
import { CATALOGS, LANGUAGES } from "./messages";

const STORAGE_KEY = "hikari:lang";

const StoredLanguage = Schema.Literals(
  LANGUAGES.map((language) => language.code) as [
    LanguageCode,
    ...Array<LanguageCode>,
  ],
);

const decodeStored = Schema.decodeUnknownOption(StoredLanguage);

function detectLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return "en";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    const fromStorage = decodeStored(stored);
    if (fromStorage._tag === "Some") {
      return fromStorage.value;
    }
  }
  const nav = window.navigator.language.slice(0, 2);
  const fromNav = decodeStored(nav);
  return fromNav._tag === "Some" ? fromNav.value : "en";
}

const MESSAGES_BY_LOCALE = {
  en: CATALOGS.en,
  fr: CATALOGS.fr,
  ja: CATALOGS.ja,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LanguageCode>(detectLanguage);

  const changeLang = useCallback((next: LanguageCode) => {
    setLang(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <InternationalizationProvider locale={lang} messages={MESSAGES_BY_LOCALE}>
      <I18nContext value={{ lang, setLang: changeLang }}>
        {children}
      </I18nContext>
    </InternationalizationProvider>
  );
}
