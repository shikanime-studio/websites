import { Link } from "@tanstack/react-router";
import { useI18n } from "../i18n/useI18n";
import { HikariMark } from "./icons";

const BUILT_WITH = [
  "TanStack Start",
  "Cloudflare Workers",
  "Cloudflare D1",
  "Cloudflare R2",
  "better-auth",
];

export function SiteFooter() {
  const { t } = useI18n();
  const year = String(new Date().getFullYear());

  return (
    <footer className="border-hairline border-t">
      <div className="hk-shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <HikariMark />
              <span className="hk-display text-ink text-[18px] font-semibold tracking-[-0.03em]">
                Hikari
              </span>
            </div>
            <p className="text-ink-soft mt-4 max-w-[30ch] text-[13px] leading-relaxed">
              {t("landing.footerTagline")}
            </p>
          </div>

          <FooterColumn title={t("landing.footerProduct")}>
            <Link className="hk-footer-link" to="/">
              {t("nav.commissions")}
            </Link>
            <Link className="hk-footer-link" to="/commissions/new">
              {t("nav.newCommission")}
            </Link>
            <a className="hk-footer-link" href="#product">
              {t("nav.product")}
            </a>
            <a className="hk-footer-link" href="#workflow">
              {t("nav.workflow")}
            </a>
          </FooterColumn>

          <FooterColumn title={t("landing.footerBuilt")}>
            {BUILT_WITH.map((item) => (
              <span className="text-ink-soft text-[12.5px]" key={item}>
                {item}
              </span>
            ))}
          </FooterColumn>

          <FooterColumn title="Elsewhere">
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
          </FooterColumn>
        </div>

        <div className="hk-hairline text-ink-faint mt-12 flex flex-col justify-between gap-2 pt-6 text-[11.5px] sm:flex-row">
          <p>{t("landing.footerRights", { year })}</p>
          <p className="font-mono tracking-[0.04em] uppercase">
            {t("landing.footerStatus")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="hk-eyebrow">{title}</p>
      {children}
    </div>
  );
}
