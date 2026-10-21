import { Button } from "@astryxdesign/core/Button";
import { useI18n } from "../i18n/useI18n";
import { ArrowLeft } from "./icons";

export function NotFoundView() {
  const { t } = useI18n();

  return (
    <div className="hk-shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p
        className="hk-display text-[clamp(4rem,12vw,7rem)] leading-none"
        style={{ color: "var(--hk-signal)" }}
      >
        404
      </p>
      <h1 className="hk-display mt-4 text-[clamp(1.6rem,3vw,2.2rem)]">
        {t("notfound.title")}
      </h1>
      <p className="text-ink-soft mt-3 text-[13.5px]">{t("notfound.body")}</p>
      <div className="mt-7">
        <Button
          href="/"
          icon={<ArrowLeft />}
          label={t("notfound.home")}
          variant="primary"
        />
      </div>
    </div>
  );
}
