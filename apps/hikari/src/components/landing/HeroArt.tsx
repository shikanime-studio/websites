import { useTranslator } from "@astryxdesign/core/i18n";
import { CANDY_GRADIENTS } from "../../lib/thumb";
import { Camera, Heart, Sparkle } from "../icons";

const INK = "#241c18";
const OUTLINE = "var(--hk-ink)";

export function HeroArt() {
  const t = useTranslator();

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-full max-w-[520px] select-none"
    >
      {/* coral disc with a camera */}
      <div
        className="absolute -top-2 -left-2 flex size-32 -rotate-6 items-center justify-center rounded-full border-2 sm:top-2 sm:left-0 sm:size-40 lg:size-44"
        style={{ background: "var(--hk-accent)", borderColor: OUTLINE }}
      >
        <Camera className="text-[#241c18]" size={44} strokeWidth={1.6} />
      </div>

      {/* lilac sticker with a heart */}
      <div
        className="absolute top-0 right-2 flex size-24 rotate-12 items-center justify-center rounded-[26px] border-2 sm:size-28 lg:size-32"
        style={{ background: "var(--hk-candy-lilac)", borderColor: OUTLINE }}
      >
        <Heart className="text-[#241c18]" size={30} strokeWidth={1.8} />
      </div>

      {/* sky disc with the event */}
      <div
        className="absolute -right-4 bottom-16 hidden size-24 -rotate-6 items-center justify-center rounded-full border-2 text-[15px] font-black sm:flex sm:size-28 xl:size-32"
        style={{ background: "var(--hk-candy-sky)", borderColor: OUTLINE, color: INK }}
      >
        C108
      </div>

      {/* sparkle */}
      <Sparkle
        className="absolute bottom-8 left-6"
        size={44}
        strokeWidth={1.4}
        style={{ color: OUTLINE }}
      />

      {/* the ticket */}
      <div
        className="absolute top-1/2 left-1/2 w-[236px] -translate-x-1/2 -translate-y-1/2 -rotate-3 rounded-[26px] border-2 bg-white p-4 sm:w-[260px] sm:p-5 lg:w-[272px] xl:w-[304px] xl:p-6"
        style={{
          borderColor: INK,
          boxShadow: "7px 7px 0 var(--hk-ink)",
        }}
      >
        <p className="text-[10px] font-black tracking-[0.12em] text-[#7a6659] uppercase">
          {t("landing.previewCommission")}
        </p>
        <p className="hk-display text-[24px] leading-none text-[#241c18] sm:text-[28px]">
          C108 · 14:30
        </p>
        <p className="mt-1.5 text-[11.5px] font-bold text-[#6f6058]">
          {t("landing.previewMap")}
        </p>

        <div className="mt-3.5 flex gap-1.5">
          {CANDY_GRADIENTS.slice(0, 3).map((background) => (
            <span
              className="h-12 flex-1 rounded-xl border border-black/10"
              key={background}
              style={{ background }}
            />
          ))}
        </div>

        <div className="mt-3.5 flex items-center justify-between">
          <span className="rounded-full bg-[#ffe07a] px-2.5 py-1 text-[11px] font-extrabold text-[#241c18]">
            {t("status.scheduled")}
          </span>
          <span className="text-[10.5px] font-black text-[#7a6659]">3/5</span>
        </div>
      </div>
    </div>
  );
}
