import type { MessageKey } from "./messages";
import { useTranslator } from "@astryxdesign/core/i18n";
import { use } from "react";
import { I18nContext } from "./context";

export function useI18n() {
  const context = use(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  const translate = useTranslator();
  return {
    ...context,
    t: (key: MessageKey, params?: Record<string, string>): string =>
      translate(key, params),
  };
}
