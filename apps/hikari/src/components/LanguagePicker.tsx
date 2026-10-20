import { LANGUAGES } from "../i18n/messages";
import { useI18n } from "../i18n/useI18n";

export function LanguagePicker() {
  const { lang, setLang, t } = useI18n();

  return (
    <label className="flex items-center gap-1 text-sm">
      <span className="sr-only">{t("nav.selectLanguage")}</span>
      <select
        className="bg-body border-border text-secondary rounded-lg border px-2 py-1 text-xs font-semibold"
        value={lang}
        onChange={(event_) => {
          setLang(event_.target.value as typeof lang);
        }}
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
