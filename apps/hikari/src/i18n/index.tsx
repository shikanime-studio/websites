import type { ReactNode } from "react";
import type { LanguageCode, MessageKey } from "./messages";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { I18nContext } from "./context";
import { LANGUAGES, MESSAGES } from "./messages";

const STORAGE_KEY = "hikari:lang";

function detectLanguage(): LanguageCode {
  if (typeof window === "undefined") {
    return "en";
  }
  const codes = LANGUAGES.map((l) => l.code);
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored !== null && codes.includes(stored as LanguageCode)) {
    return stored as LanguageCode;
  }
  const nav = window.navigator.language.slice(0, 2);
  return codes.includes(nav as LanguageCode)
    ? (nav as LanguageCode)
    : "en";
}




export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(detectLanguage);

  const setLang = useCallback((next: LanguageCode) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string>) => {
      let text: string = MESSAGES[lang][key];
      if (params) {
        for (const [name, value] of Object.entries(params)) {
          text = text.replaceAll(`{${name}}`, value);
        }
      }
      return text;
    },
    [lang],
  );

  return (
    <I18nContext value={{ lang, setLang, t }}>
      {children}
    </I18nContext>
  );
}
