import type { LanguageCode } from "./messages";
import { createContext } from "react";

export interface I18nContextValue {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
