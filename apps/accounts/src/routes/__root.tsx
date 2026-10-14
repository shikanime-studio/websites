import { Theme as AstryxTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../assets/global.css?url";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { queryClient } from "../lib/query-client";

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
        content: "#f5f5f5",
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
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AstryxTheme theme={neutralTheme} mode="system">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="grow pt-16">
            <Outlet />
          </main>
          <Footer />
        </div>
      </AstryxTheme>
    </QueryClientProvider>
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
