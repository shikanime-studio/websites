import type { LanguageCode, MessageKey } from "./messages";
import { createContext } from "react";

export interface I18nContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: MessageKey, params?: Record<string, string>) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
