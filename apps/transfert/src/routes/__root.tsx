import { Heading } from "@astryxdesign/core/Heading";
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

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Transfert" },
      {
        name: "description",
        content: "Send files that expire. No accounts.",
      },
      { name: "theme-color", content: "#faf6f0" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-accent/10 text-accent flex size-12 items-center justify-center rounded-full text-sm font-black">
          ?
        </span>
        <Heading level={1} type="display-3" className="font-display">
          This page doesn't exist
        </Heading>
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <RegistryProvider>
      <AstryxTheme theme={neutralTheme} mode="system">
        <ToastViewport position="bottomEnd" maxVisible={4} />
        <div className="flex min-h-screen flex-col">
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
              {
                href: "https://shikanime.studio",
                label: "Studio ↗",
                external: true,
              },
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
