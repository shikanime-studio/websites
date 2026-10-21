import { useTranslator } from "@astryxdesign/core/i18n";
import { SiteFooter } from "../Footer";
import { ArrowRight } from "../icons";
import { SignInButton } from "../SignInButton";
import { HeroArt } from "./HeroArt";

export function LandingPage() {
  const t = useTranslator();
  const beats = ["landing.beat1", "landing.beat2", "landing.beat3"] as const;

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="hk-grid-texture pointer-events-none absolute inset-0 opacity-60"
        />
        <div
          aria-hidden="true"
          className="hk-warm-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        />

        <div className="hk-shell relative pt-14 text-center md:pt-20">
          <span className="hk-chip">
            <span
              className="size-1.5 rounded-full"
              style={{ background: "var(--hk-signal)" }}
            />
            {t("landing.eyebrow")}
          </span>

          <h1 className="hk-display mx-auto mt-6 max-w-[13ch] text-[clamp(3.4rem,10vw,7rem)]">
            <span className="block">{t("landing.titleTop")}</span>
            <span className="block">{t("landing.titleAccent")}</span>
          </h1>

          <p className="hk-display-light text-ink-soft mx-auto mt-6 max-w-[32rem] text-[16px] leading-relaxed font-medium text-balance">
            {t("landing.body")}
          </p>

          <div className="mt-8 flex justify-center">
            <SignInButton label={t("landing.ctaPrimary")} />
          </div>
          <p className="text-ink-faint mt-3 text-[12px] font-medium">
            {t("landing.note")}
          </p>
        </div>

        <div className="hk-shell relative pt-10 pb-16 md:pt-14 md:pb-24">
          <HeroArt />
        </div>
      </section>

      <section className="border-hairline bg-[var(--hk-surface)] border-t">
        <ol className="hk-shell flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-5">
          {beats.map((beat, index) => (
            <li className="flex items-center gap-3" key={beat}>
              <span className="text-[13px] font-extrabold">{t(beat)}</span>
              {index < beats.length - 1 ? (
                <ArrowRight className="text-ink-faint" size={14} />
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter />
    </>
  );
}
