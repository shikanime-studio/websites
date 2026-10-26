import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@astryxdesign/core/Button";
import { useTranslator } from "@astryxdesign/core/i18n";
import { Theme as AstryxTheme } from "@astryxdesign/core/theme";
import { RegistryProvider } from "@effect/atom-react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../assets/global.css?url";
import { Alert, HikariMark } from "../components/icons";
import { Navbar } from "../components/Navbar";
import { NotFoundView } from "../components/NotFoundView";
import { I18nProvider } from "../i18n";
import { hikariTheme } from "../theme/hikari";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { themeColor: "#ff6433" },
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hikari — cosplay photoshoot commissions" },
      {
        name: "description",
        content:
          "Request a cosplay photoshoot, agree on place and time, receive the photos, and follow every stage in one workspace.",
      },
      { name: "theme-color", content: "#fff8f0", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#171110", media: "(prefers-color-scheme: dark)" },
      { property: "og:title", content: "Hikari — cosplay photoshoot commissions" },
      {
        property: "og:description",
        content:
          "One workspace for the whole shoot: the request, the place, the time, the photos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#ff6433" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Hikari" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icon-192.svg" },
    ],
  }),
  component: RootComponent,
  errorComponent: RootError,
  notFoundComponent: NotFoundView,
  shellComponent: RootDocument,
});

function RootError({ reset }: ErrorComponentProps) {
  return (
    <AstryxTheme mode="system" theme={hikariTheme}>
      <I18nProvider>
        <RootErrorPanel reset={reset} />
      </I18nProvider>
    </AstryxTheme>
  );
}

function RootErrorPanel({ reset }: { reset: () => void }) {
  const t = useTranslator();
  return (
    <div className="hk-shell flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <HikariMark />
      <span
        className="mt-5 flex size-11 items-center justify-center rounded-full"
        style={{
          background: "var(--hk-danger-soft)",
          color: "var(--hk-danger)",
        }}
      >
        <Alert size={20} />
      </span>
      <h1 className="hk-display mt-4 text-[clamp(1.7rem,3.2vw,2.3rem)]">
        {t("error.title")}
      </h1>
      <p className="text-ink-soft mt-3 max-w-sm text-[13.5px]">
        {t("error.body")}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Button
          label={t("error.reload")}
          onClick={() => {
            window.location.reload();
          }}
          variant="primary"
        />
        <Button label={t("error.retry")} onClick={reset} variant="secondary" />
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <RegistryProvider>
      <AstryxTheme mode="system" theme={hikariTheme}>
        <I18nProvider>
          <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main className="flex grow flex-col">
              <Outlet />
            </main>
          </div>
        </I18nProvider>
      </AstryxTheme>
    </RegistryProvider>
  );
}

const SW_REGISTER = `if("serviceWorker" in navigator){addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})})}`;

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html data-astryx-theme="neutral" lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <script dangerouslySetInnerHTML={{ __html: SW_REGISTER }} />
      </body>
    </html>
  );
}
