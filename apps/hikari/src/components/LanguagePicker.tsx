import { useTranslator } from "@astryxdesign/core/i18n";
import { Selector } from "@astryxdesign/core/Selector";
import { useSyncExternalStore } from "react";
import { LANGUAGES } from "../i18n/messages";
import { currentLocale } from "../lib/preferences";
import { Globe } from "./icons";

export function LanguagePicker() {
  const t = useTranslator();
  const lang = useSyncExternalStore(
    currentLocale.subscribe,
    currentLocale.get,
    () => "en" as const,
  );

  return (
    <Selector
      isLabelHidden
      label={t("nav.selectLanguage")}
      onChange={(value) => {
        const match = LANGUAGES.find((language) => language.code === value);
        if (match) {
          currentLocale.set(match.code);
        }
      }}
      options={LANGUAGES.map((language) => ({
        label: language.label,
        value: language.code,
      }))}
      size="sm"
      startIcon={<Globe size={15} />}
      value={lang}
      variant="ghost"
    />
  );
}
