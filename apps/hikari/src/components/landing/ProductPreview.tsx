import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { useI18n } from "../../i18n/useI18n";
import { CANDY_GRADIENTS } from "../../lib/thumb";
import { Bell, CalendarIcon, Camera, Check, Heart, MapPin } from "../icons";

const PHOTO_TILES = CANDY_GRADIENTS.slice(0, 4);

export function ProductPreview() {
  const { t } = useI18n();

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div
        aria-hidden="true"
        className="hk-warm-glow absolute -inset-10 -z-10 rounded-full blur-2xl"
      />

      <Card
        className="relative z-10 overflow-hidden"
        padding={0}
        style={{ boxShadow: "var(--hk-shadow-lg)" }}
      >
        <div className="hk-thumb h-36 sm:h-40">
          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
            <span className="hk-sticker">C108</span>
          </div>
          <span
            aria-hidden="true"
            className="hk-avatar absolute right-3 bottom-3 z-10"
            style={{ width: 30, height: 30 }}
          >
            <Heart size={14} />
          </span>
          <Camera
            aria-hidden="true"
            className="absolute -right-2 -bottom-3 text-white/35"
            size={96}
            strokeWidth={1.2}
          />
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="hk-eyebrow">
              {t("landing.previewCommission")}
            </span>
            <Badge label={t("status.scheduled")} variant="yellow" />
          </div>

          <h3 className="hk-display mt-3 text-[25px] sm:text-[28px]">
            {t("landing.previewTitle")}
          </h3>
          <p className="text-ink-soft mt-1.5 text-sm">
            {t("landing.previewCharacter")}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div
              className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
              style={{ background: "var(--hk-surface-muted)" }}
            >
              <CalendarIcon className="text-ink-soft shrink-0" size={17} />
              <div className="min-w-0">
                <p className="text-ink-faint text-[10.5px] font-semibold">
                  {t("landing.previewDate")}
                </p>
                <p className="text-ink truncate text-[12.5px] font-bold">
                  14:30
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
              style={{ background: "var(--hk-surface-muted)" }}
            >
              <MapPin className="text-ink-soft shrink-0" size={17} />
              <div className="min-w-0">
                <p className="text-ink-faint text-[10.5px] font-semibold">
                  {t("landing.previewHall")}
                </p>
                <p className="text-ink truncate text-[12.5px] font-bold">
                  {t("landing.previewMap")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-ink-soft text-[11.5px] font-bold">
                {t("landing.previewStep")}
              </span>
              <span className="text-ink-faint text-[11px] font-semibold">
                3/5
              </span>
            </div>
            <div
              aria-hidden="true"
              className="mt-2 flex items-center gap-1.5"
              role="presentation"
            >
              {[0, 1, 2, 3, 4].map((index) => (
                <span
                  className="h-2 flex-1 rounded-full"
                  key={index}
                  style={{
                    background:
                      index < 2
                        ? "var(--hk-accent)"
                        : index === 2
                          ? "var(--hk-signal)"
                          : "var(--hk-line)",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {PHOTO_TILES.map((background, index) => (
              <div
                aria-hidden="true"
                className="aspect-square rounded-[14px]"
                key={background}
                style={{ background }}
              >
                {index === 3 ? (
                  <span className="flex h-full w-full items-center justify-center text-[11px] font-black text-[#241c18]">
                    +9
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card
        className="absolute -top-6 -right-2 z-20 hidden w-[228px] items-start gap-2.5 sm:flex lg:-top-8 lg:-right-6"
        elevation="med"
        padding={3}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--hk-signal)", color: "#241c18" }}
        >
          <Bell size={15} />
        </span>
        <div className="min-w-0">
          <p className="text-ink text-[12px] leading-tight font-bold">
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
          style={{ background: "var(--hk-candy-lime)", color: "#241c18" }}
        >
          <Check size={13} />
        </span>
        <div>
          <p className="text-ink text-[12px] leading-tight font-bold">
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
