import type { MessageKey } from "../../i18n/messages";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { useI18n } from "../../i18n/useI18n";
import { COMMISSION_STATUSES } from "../../lib/hikari";
import { statusVariant } from "../../lib/status";
import { SiteFooter } from "../Footer";
import {
  ArrowRight,
  Bell,
  CalendarIcon,
  Camera,
  Check,
  Globe,
  Grid,
  Images,
  MapPin,
  Sparkle,
} from "../icons";
import { SignInButton } from "../SignInButton";
import { ProductPreview } from "./ProductPreview";

export function LandingPage() {
  const { t } = useI18n();

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="hk-grid-texture pointer-events-none absolute inset-0 opacity-70"
        />
        <div
          aria-hidden="true"
          className="hk-warm-glow pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        />

        <div className="hk-shell relative grid gap-16 pt-14 pb-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-12 lg:pt-20 lg:pb-28">
          <div className="hk-rise">
            <span className="hk-chip">
              <span
                className="hk-live-dot size-1.5 rounded-full"
                style={{ background: "var(--hk-signal)" }}
              />
              {t("landing.eyebrow")}
            </span>

            <h1 className="hk-display mt-6 text-[clamp(2.7rem,5.9vw,4.6rem)]">
              <span className="hk-display-light text-ink-soft block">
                {t("landing.titleTop")}
              </span>
              <span className="mt-1 block">{t("landing.titleAccent")}</span>
            </h1>

            <p className="text-ink-soft mt-6 max-w-[47ch] text-[16px] leading-[1.65]">
              {t("landing.body")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <SignInButton className="w-full sm:w-auto" />
              <Button
                className="hk-btn-outline w-full sm:w-auto"
                endContent={<ArrowRight />}
                href="#workflow"
                label={t("landing.ctaSecondary")}
                variant="secondary"
              />
            </div>

            <p className="text-ink-faint mt-4 text-[12px]">
              {t("landing.note")}
            </p>
          </div>

          <div className="hk-rise hk-delay-2 relative">
            <ProductPreview />
          </div>
        </div>

        <div className="border-hairline border-t">
          <div className="hk-shell flex flex-wrap items-center gap-x-8 gap-y-2 py-4">
            {[
              t("landing.feature2Title"),
              t("landing.feature3Title"),
              t("landing.feature4Title"),
              t("landing.feature6Title"),
            ].map((item) => (
              <span
                className="text-ink-faint flex items-center gap-2 text-[12px] font-medium"
                key={item}
              >
                <Check size={13} className="opacity-60" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="hk-shell py-20 md:py-28" id="product">
        <SectionHead
          body={t("landing.pipelineBody")}
          eyebrow={t("landing.pipelineEyebrow")}
          title={t("landing.pipelineTitle")}
        />

        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {COMMISSION_STATUSES.map((status, index) => (
            <li className="h-full" key={status}>
              <Card
                className="h-full transition-colors hover:border-[var(--hk-line-strong)]"
                padding={5}
              >
              <div className="flex items-center justify-between gap-2">
                <span className="hk-eyebrow text-ink-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Badge
                  label={t(`status.${status}`)}
                  variant={statusVariant(status)}
                />
              </div>
              <p className="text-ink-soft mt-5 text-[12.5px] leading-[1.6]">
                {t(`landing.stage.${status}Body`)}
              </p>
              <span aria-hidden="true" className="mt-auto block pt-5">
                <span className="bg-hairline block h-px w-full" />
              </span>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="border-hairline bg-paper border-y py-20 md:py-28"
        id="roles"
      >
        <div className="hk-shell">
          <SectionHead
            body={t("landing.rolesBody")}
            eyebrow={t("landing.rolesEyebrow")}
            title={t("landing.rolesTitle")}
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <RoleCard
              accent="var(--hk-signal)"
              icon={<Sparkle size={18} />}
              items={[
                t("landing.roleClient1"),
                t("landing.roleClient2"),
                t("landing.roleClient3"),
                t("landing.roleClient4"),
              ]}
              summary={t("landing.roleClientBody")}
              title={t("landing.roleClientTitle")}
            />
            <RoleCard
              accent="var(--hk-accent)"
              icon={<Camera size={18} />}
              items={[
                t("landing.roleShooter1"),
                t("landing.roleShooter2"),
                t("landing.roleShooter3"),
                t("landing.roleShooter4"),
              ]}
              summary={t("landing.roleShooterBody")}
              title={t("landing.roleShooterTitle")}
            />
          </div>
        </div>
      </section>

      <section className="hk-shell py-20 md:py-28">
        <SectionHead
          body={t("landing.featuresBody")}
          eyebrow={t("landing.featuresEyebrow")}
          title={t("landing.featuresTitle")}
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<Grid size={17} />}
            title={t("landing.feature1Title")}
          >
            {t("landing.feature1Body")}
          </FeatureCard>
          <FeatureCard
            icon={<MapPin size={17} />}
            title={t("landing.feature2Title")}
          >
            {t("landing.feature2Body")}
          </FeatureCard>
          <FeatureCard
            icon={<CalendarIcon size={17} />}
            title={t("landing.feature3Title")}
          >
            {t("landing.feature3Body")}
          </FeatureCard>
          <FeatureCard
            icon={<Images size={17} />}
            title={t("landing.feature4Title")}
          >
            {t("landing.feature4Body")}
          </FeatureCard>
          <FeatureCard
            icon={<Bell size={17} />}
            title={t("landing.feature5Title")}
          >
            {t("landing.feature5Body")}
          </FeatureCard>
          <FeatureCard
            icon={<Globe size={17} />}
            title={t("landing.feature6Title")}
          >
            {t("landing.feature6Body")}
          </FeatureCard>
        </div>
      </section>

      <section
        className="border-hairline bg-paper border-y py-20 md:py-28"
        id="workflow"
      >
        <div className="hk-shell">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHead
              body={t("landing.stepsBody")}
              eyebrow={t("landing.stepsEyebrow")}
              title={t("landing.stepsTitle")}
            />
          </div>

          <ol className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["landing.step1Title", "landing.step1Body"],
                ["landing.step2Title", "landing.step2Body"],
                ["landing.step3Title", "landing.step3Body"],
                ["landing.step4Title", "landing.step4Body"],
              ] satisfies ReadonlyArray<readonly [MessageKey, MessageKey]>
            ).map(([titleKey, bodyKey], index) => (
              <li className="relative" key={titleKey}>
                <div className="border-hairline flex items-center gap-3 border-t pt-4">
                  <span className="hk-eyebrow text-ink-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full"
                    style={{
                      background:
                        index === 0 ? "var(--hk-signal)" : "var(--hk-line-strong)",
                    }}
                  />
                </div>
                <h3 className="hk-display text-ink mt-4 text-[19px]">
                  {t(titleKey)}
                </h3>
                <p className="text-ink-soft mt-2 text-[12.5px] leading-[1.65]">
                  {t(bodyKey)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="hk-shell py-20 md:py-28" id="start">
        <div
          className="relative overflow-hidden rounded-[30px] px-7 py-14 md:px-14 md:py-20"
          style={{ background: "var(--hk-ink)", color: "var(--hk-canvas)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-12 hidden -translate-y-1/2 select-none lg:block"
            style={{
              fontFamily:
                '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif',
              fontSize: 240,
              fontWeight: 700,
              lineHeight: 1,
              color: "var(--hk-signal)",
              opacity: 0.11,
            }}
          >
            光
          </div>
          <div
            aria-hidden="true"
            className="absolute -bottom-32 left-1/4 size-[320px] rounded-full blur-[100px]"
            style={{ background: "var(--hk-accent)", opacity: 0.28 }}
          />

          <div className="relative max-w-3xl">
            <p className="hk-eyebrow" style={{ color: "var(--hk-signal)" }}>
              Hikari
            </p>
            <h2 className="hk-display mt-4 text-[clamp(2rem,4.4vw,3.3rem)] text-inherit">
              {t("landing.ctaTitle")}
            </h2>
            <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-inherit opacity-80">
              {t("landing.ctaBody")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <SignInButton
                label={t("landing.ctaButton")}
                variant="signal"
                className="w-full sm:w-auto"
              />
              <span className="text-[12px] text-inherit opacity-60">
                {t("landing.ctaNote")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

function SectionHead({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="hk-eyebrow">{eyebrow}</p>
      <h2 className="hk-display mt-4 text-[clamp(1.9rem,3.5vw,2.85rem)]">
        {title}
      </h2>
      <p className="text-ink-soft mt-4 max-w-[58ch] text-[14.5px] leading-[1.7]">
        {body}
      </p>
    </div>
  );
}

function RoleCard({
  accent,
  icon,
  title,
  summary,
  items,
}: {
  accent: string;
  icon: React.ReactNode;
  title: string;
  summary: string;
  items: string[];
}) {
  return (
    <Card
      className="bg-paper h-full"
      padding={0}
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span
            className="text-ink flex size-9 items-center justify-center rounded-full"
            style={{ background: "var(--hk-surface-muted)" }}
          >
            {icon}
          </span>
          <h3 className="hk-display text-[21px]">{title}</h3>
        </div>
        <p className="text-ink-soft mt-3 text-[13.5px] leading-relaxed">
          {summary}
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {items.map((item) => (
            <li className="flex items-start gap-2.5" key={item}>
              <span
                className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "var(--hk-surface-muted)",
                  color: "var(--hk-ink)",
                }}
              >
                <Check size={10} />
              </span>
              <span className="text-ink text-[13px] leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className="group h-full transition-colors hover:border-[var(--hk-line-strong)]"
      padding={6}
    >
      <span
        className="text-ink flex size-9 items-center justify-center rounded-[10px] transition-transform duration-300 group-hover:-translate-y-0.5"
        style={{ background: "var(--hk-surface-muted)" }}
      >
        {icon}
      </span>
      <h3 className="text-ink mt-5 text-[14.5px] font-semibold tracking-[-0.01em]">
        {title}
      </h3>
      <p className="text-ink-soft mt-2 text-[12.5px] leading-[1.65]">
        {children}
      </p>
    </Card>
  );
}
