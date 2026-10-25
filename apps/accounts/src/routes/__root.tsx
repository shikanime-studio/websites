import { Theme as AstryxTheme } from "@astryxdesign/core/theme";
import { ToastViewport } from "@astryxdesign/core/Toast";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { RegistryProvider } from "@effect/atom-react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
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
  // The Accounts Center runs without the marketing chrome, the way an account
  // hub should: the sidebar is the navigation.
  const inCenter = useRouterState({
    select: (state) => state.location.pathname.startsWith("/settings"),
  });

  return (
    <RegistryProvider>
      <AstryxTheme theme={neutralTheme} mode="system">
        <ToastViewport position="bottomEnd" maxVisible={4} />
      <div className="flex min-h-screen flex-col">
        {inCenter ? null : <Navbar />}
        <main className={inCenter ? "grow" : "grow pt-14"}>
          <Outlet />
        </main>
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
