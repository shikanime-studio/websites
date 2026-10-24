import { useTranslator } from "@astryxdesign/core/i18n";
import { SiteFooter } from "../Footer";
import {
  CalendarIcon,
  Check,
  Images,
  MapPin,
  Users,
} from "../icons";
import { SignInButton } from "../SignInButton";
import { HeroArt } from "./HeroArt";

const STEP_KEYS = [
  { key: "step1", title: "landing.step1Title", body: "landing.step1Body" },
  { key: "step2", title: "landing.step2Title", body: "landing.step2Body" },
  { key: "step3", title: "landing.step3Title", body: "landing.step3Body" },
] as const;

const SHARE_POINTS = [
  "landing.sharePoint1",
  "landing.sharePoint2",
  "landing.sharePoint3",
] as const;

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

            <p className="hk-display-light text-ink-soft mx-auto mt-5 max-w-[30rem] text-[16.5px] leading-relaxed font-medium text-balance lg:mt-6 lg:mx-0">
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

      <section className="border-hairline border-t">
        <div className="hk-shell py-14 md:py-20">
          <p className="hk-eyebrow">{t("landing.howTitle")}</p>
          <h2 className="hk-display mt-3 max-w-xl text-[clamp(1.8rem,3.4vw,2.6rem)]">
            {t("landing.howHeading")}
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {STEP_KEYS.map((step, index) => (
              <li
                className="border-hairline flex flex-col gap-3 border-t pt-5"
                key={step.key}
              >
                <span className="hk-eyebrow text-ink-faint">
                  0{String(index + 1)}
                </span>
                <p className="text-ink text-[15px] font-semibold">
                  {t(step.title)}
                </p>
                <p className="text-ink-soft text-[13px] leading-relaxed">
                  {t(step.body)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="border-hairline border-t"
        style={{ background: "var(--hk-surface-muted)" }}
      >
        <div className="hk-shell grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div>
            <p className="hk-eyebrow">{t("landing.shareEyebrow")}</p>
            <h2 className="hk-display mt-3 text-[clamp(1.9rem,3.6vw,2.8rem)]">
              {t("landing.shareTitle")}
            </h2>
            <p className="text-ink-soft mt-4 max-w-md text-[13.5px] leading-relaxed">
              {t("landing.shareBody")}
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {SHARE_POINTS.map((point) => (
                <li
                  className="text-ink flex items-start gap-2.5 text-[13px]"
                  key={point}
                >
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "var(--hk-accent)",
                      color: "var(--hk-on-accent)",
                    }}
                  >
                    <Check size={11} />
                  </span>
                  {t(point)}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <SignInButton label={t("landing.ctaPrimary")} size="lg" />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[380px] lg:mx-0 lg:ml-auto">
            <div className="border-hairline bg-[var(--hk-surface)] overflow-hidden rounded-2xl border shadow-[0_24px_60px_-30px_rgba(40,24,10,0.35)]">
              <div className="border-hairline flex items-center justify-between border-b px-5 py-4">
                <div>
                  <p className="hk-eyebrow text-ink-faint">Shooting recap</p>
                  <p className="text-ink mt-1 text-[13px] font-semibold">
                    Autumn portrait
                  </p>
                </div>
                <span className="hk-chip text-[10px]">Scheduled</span>
              </div>
              <div className="flex flex-col gap-3 px-5 py-4">
                <p className="text-ink-soft flex items-center gap-2 text-[11.5px]">
                  <CalendarIcon size={13} /> Sat 14 Nov · 15:30
                </p>
                <p className="text-ink-soft flex items-center gap-2 text-[11.5px]">
                  <MapPin size={13} /> Parc de Bercy, Paris
                </p>
                <p className="text-ink-soft flex items-center gap-2 text-[11.5px]">
                  <Users size={13} /> 4 people · model, helper, client
                </p>
              </div>
              <div className="border-hairline border-t px-5 py-4">
                <p className="hk-eyebrow text-ink-faint">Progress</p>
                <div className="mt-3 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((step) => (
                    <span
                      className="h-1.5 flex-1 rounded-full"
                      key={step}
                      style={{
                        background:
                          step <= 3
                            ? "var(--hk-accent)"
                            : "var(--hk-hairline, #e7e0d6)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-ink-soft mt-2 text-[11px]">
                  Booked · Scheduled · Shoot day
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 px-5 pb-5">
                {[
                  "linear-gradient(150deg,#e9b38d,#c96b3e)",
                  "linear-gradient(150deg,#d9c3a5,#8f6b4c)",
                  "linear-gradient(150deg,#c7b9a8,#6f6256)",
                ].map((background) => (
                  <span
                    className="aspect-[4/5] rounded-lg"
                    key={background}
                    style={{ background }}
                  />
                ))}
              </div>
              <div className="border-hairline text-ink-faint flex items-center gap-1.5 border-t px-5 py-3 text-[10.5px]">
                <Images size={12} /> Private link · no account needed
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-hairline border-t">
        <div className="hk-shell flex flex-col items-center gap-4 py-16 text-center md:py-20">
          <h2 className="hk-display max-w-xl text-[clamp(1.9rem,4vw,3rem)]">
            {t("landing.closingTitle")}
          </h2>
          <p className="text-ink-soft max-w-md text-[13.5px] leading-relaxed">
            {t("landing.closingBody")}
          </p>
          <div className="mt-2">
            <SignInButton label={t("landing.ctaPrimary")} size="lg" />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
