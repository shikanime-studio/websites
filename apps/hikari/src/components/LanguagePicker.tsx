import { Selector } from "@astryxdesign/core/Selector";
import { LANGUAGES } from "../i18n/messages";
import { useI18n } from "../i18n/useI18n";
import { Globe } from "./icons";

export function LanguagePicker() {
  const { lang, setLang, t } = useI18n();

  return (
    <Selector
      isLabelHidden
      label={t("nav.selectLanguage")}
      onChange={(value) => {
        const match = LANGUAGES.find((language) => language.code === value);
        if (match) {
          setLang(match.code);
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
