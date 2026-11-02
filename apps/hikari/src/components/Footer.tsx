import { useTranslator } from "@astryxdesign/core/i18n";
import { StudioFooter } from "@shikanime-studio/design";
import { HikariMark } from "./icons";

export function SiteFooter() {
  const t = useTranslator();
  const year = String(new Date().getFullYear());

  return (
    <StudioFooter
      brand={{
        name: "Hikari",
        href: "/",
        mark: <HikariMark className="size-6" />,
      }}
      links={[
        {
          href: "https://shikanime.studio",
          label: "Shikanime Studio ↗",
          external: true,
        },
        {
          href: "https://docs.shikanime.studio",
          label: `${t("landing.footerDocs")} ↗`,
          external: true,
        },
      ]}
      note={t("landing.footerRights", { year })}
    />
  );
}
