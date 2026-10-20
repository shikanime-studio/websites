import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "../i18n/useI18n";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  const { t } = useI18n();
  return (
    <main className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-secondary text-4xl font-black tracking-tight">404</h1>
      <p className="text-secondary/60">{t("notfound.title")}</p>
      <p className="text-secondary/60 text-sm">{t("notfound.body")}</p>
    </main>
  );
}
