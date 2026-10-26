import { Theme as AstryxTheme } from "@astryxdesign/core/theme";
import { ToastViewport } from "@astryxdesign/core/Toast";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { RegistryProvider } from "@effect/atom-react";
import { StudioFooter } from "@shikanime-studio/design";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../assets/global.css?url";
import { Navbar } from "../components/Navbar";
import { NotFound } from "../components/NotFound";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Accounts",
      },
      {
        name: "description",
        content: "One account for all of Shikanime Studio",
      },
      {
        name: "theme-color",
        content: "#faf6f0",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <RegistryProvider>
      <AstryxTheme theme={neutralTheme} mode="system">
        <ToastViewport position="bottomEnd" maxVisible={4} />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="grow">
            <Outlet />
          </main>
          <StudioFooter
            brand={{
              name: "Shikanime Studio",
              href: "https://shikanime.studio",
              mark: (
                <span className="bg-accent text-on-accent flex size-6 items-center justify-center rounded-md text-[10px] font-black">
                  S
                </span>
              ),
            }}
            links={[
              { href: "https://shikanime.studio", label: "Studio ↗", external: true },
              { href: "https://hikari.shikanime.studio", label: "Hikari ↗", external: true },
              { href: "https://reiya.shikanime.studio", label: "Reiya ↗", external: true },
              { href: "https://fade.shikanime.studio", label: "Fade ↗", external: true },
            ]}
            note={`© ${String(new Date().getFullYear())} Shikanime Studio`}
          />
        </div>
      </AstryxTheme>
    </RegistryProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-astryx-theme="neutral">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
