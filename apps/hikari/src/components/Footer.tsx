import { useI18n } from "../i18n/useI18n";
import { HikariMark } from "./icons";

export function SiteFooter() {
  const { t } = useI18n();
  const year = String(new Date().getFullYear());

  return (
    <footer className="border-hairline mt-auto border-t">
      <div className="hk-shell flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <HikariMark />
          <span className="hk-display text-[17px] font-semibold tracking-[-0.02em]">
            Hikari
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            className="hk-footer-link"
            href="https://shikanime.studio"
            rel="noopener noreferrer"
            target="_blank"
          >
            Shikanime Studio ↗
          </a>
          <a
            className="hk-footer-link"
            href="https://docs.shikanime.studio"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("landing.footerDocs")} ↗
          </a>
        </nav>

        <p className="text-ink-faint text-[11px] font-medium">
          {t("landing.footerRights", { year })}
        </p>
      </div>
    </footer>
  );
}
