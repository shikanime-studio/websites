import { useTranslator } from "@astryxdesign/core/i18n";
import { SiteFooter } from "../Footer";
import { SignInButton } from "../SignInButton";
import { HeroArt } from "./HeroArt";

export function LandingPage() {
  const t = useTranslator();

  return (
    <>
      <section className="relative flex grow items-center overflow-hidden">
        <div
          aria-hidden="true"
          className="hk-grid-texture pointer-events-none absolute inset-0 opacity-60"
        />
        <div
          aria-hidden="true"
          className="hk-warm-glow pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        />

        <div className="hk-shell relative grid items-center gap-7 pt-8 pb-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8 lg:pt-14 lg:pb-16">
          <div className="text-center lg:text-left">
            <span className="hk-chip">
              <span
                className="size-1.5 rounded-full"
                style={{ background: "var(--hk-signal)" }}
              />
              {t("landing.eyebrow")}
            </span>

            <h1 className="hk-display mt-6 text-[clamp(3.2rem,7vw,5.6rem)]">
              <span className="block">{t("landing.titleTop")}</span>
              <span className="block">{t("landing.titleAccent")}</span>
            </h1>

            <p className="hk-display-light text-ink-soft mx-auto mt-5 max-w-[30rem] lg:mt-6 text-[16.5px] leading-relaxed font-medium text-balance lg:mx-0">
              {t("landing.body")}
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 lg:mt-8 lg:items-start">
              <SignInButton label={t("landing.ctaPrimary")} size="lg" />
              <p className="text-ink-faint text-[12px] font-medium">
                {t("landing.note")}
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[360px] sm:max-w-[420px] lg:max-w-none">
            <HeroArt />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
