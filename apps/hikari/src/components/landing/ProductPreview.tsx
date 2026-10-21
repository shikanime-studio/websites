import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { useI18n } from "../../i18n/useI18n";
import { Bell, CalendarIcon, Check, MapPin } from "../icons";

const PHOTO_TILES = [
  "linear-gradient(142deg, #ffd21f 0%, #ff9d4d 52%, #b23a2e 100%)",
  "linear-gradient(142deg, #0a1317 0%, #2c4a5e 58%, #0064e0 100%)",
  "linear-gradient(142deg, #ece7d8 0%, #cdc4ad 100%)",
  "linear-gradient(142deg, #0064e0 0%, #69a7ff 58%, #ffe6a1 100%)",
];

export function ProductPreview() {
  const { t } = useI18n();

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div
        aria-hidden="true"
        className="hk-warm-glow absolute -inset-10 -z-10 rounded-full blur-2xl"
      />

      <Card
        className="relative z-10"
        elevation="high"
        padding={5}
        style={{ boxShadow: "var(--hk-shadow-lg)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="hk-eyebrow">{t("landing.previewCommission")}</span>
          <Badge label={t("status.scheduled")} variant="yellow" />
        </div>

        <h3 className="hk-display mt-4 text-[26px] sm:text-[28px]">
          {t("landing.previewTitle")}
        </h3>
        <p className="text-ink-soft mt-1.5 text-sm">
          {t("landing.previewCharacter")}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Card className="flex items-center gap-2.5" padding={3} variant="muted">
            <CalendarIcon className="text-ink-soft shrink-0" size={17} />
            <div className="min-w-0">
              <p className="hk-eyebrow text-[9.5px]">
                {t("landing.previewDate")}
              </p>
              <p className="text-ink truncate text-[12.5px] font-semibold">
                14:30
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-2.5" padding={3} variant="muted">
            <MapPin className="text-ink-soft shrink-0" size={17} />
            <div className="min-w-0">
              <p className="hk-eyebrow text-[9.5px]">
                {t("landing.previewHall")}
              </p>
              <p className="text-ink truncate text-[12.5px] font-semibold">
                {t("landing.previewMap")}
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="hk-eyebrow">{t("landing.previewStep")}</span>
            <span className="text-ink-faint text-[11px] font-medium">3/5</span>
          </div>
          <div
            aria-hidden="true"
            className="mt-2 flex items-center gap-1.5"
            role="presentation"
          >
            {[0, 1, 2, 3, 4].map((index) => (
              <span
                className="h-1.5 flex-1 rounded-full"
                key={index}
                style={{
                  background:
                    index < 3
                      ? "var(--hk-accent)"
                      : "var(--hk-line-strong)",
                  opacity: index < 3 ? 1 : 0.55,
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {PHOTO_TILES.map((background, index) => (
            <div
              aria-hidden="true"
              className="ring-hairline aspect-square rounded-[10px] ring-1 ring-inset"
              key={background}
              style={{ background }}
            >
              {index === 3 ? (
                <span className="text-ink flex h-full w-full items-center justify-center text-[11px] font-bold">
                  +9
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card
        className="absolute -top-20 -right-2 z-20 hidden w-[228px] items-start gap-2.5 sm:flex lg:-top-24 lg:-right-6"
        elevation="med"
        padding={3}
      >
        <span
          className="text-ink flex size-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--hk-signal-soft)" }}
        >
          <Bell size={15} />
        </span>
        <div className="min-w-0">
          <p className="text-ink text-[12px] leading-tight font-semibold">
            {t("landing.previewNotifTitle")}
          </p>
          <p className="text-ink-soft mt-0.5 truncate text-[11px]">
            {t("landing.previewNotifBody")}
          </p>
        </div>
      </Card>

      <Card
        className="absolute -bottom-5 -left-4 z-20 flex items-center gap-2.5 lg:-left-10"
        elevation="med"
        padding={3}
      >
        <span
          className="flex size-6 items-center justify-center rounded-full"
          style={{
            background: "var(--hk-success-soft)",
            color: "var(--hk-success)",
          }}
        >
          <Check size={13} />
        </span>
        <div>
          <p className="text-ink text-[12px] leading-tight font-semibold">
            {t("landing.previewPhotos")}
          </p>
          <p className="text-ink-faint text-[10.5px]">
            {t("landing.previewDelivered")}
          </p>
        </div>
      </Card>
    </div>
  );
}
