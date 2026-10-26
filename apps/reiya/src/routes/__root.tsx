import { Theme as AstryxTheme } from "@astryxdesign/core/theme";
import { ToastViewport } from "@astryxdesign/core/Toast";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { RegistryProvider } from "@effect/atom-react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../assets/global.css?url";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

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
        title: "Reiya",
      },
      {
        name: "description",
        content: "Let's bankrupt together",
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
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
      {
        rel: "mask-icon",
        href: "/safari-pinned-tab.svg",
        color: "#f5712c",
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <RegistryProvider>
      <AstryxTheme theme={neutralTheme} mode="system">
        <ToastViewport position="bottomEnd" maxVisible={4} />
        <RootLayout />
      </AstryxTheme>
    </RegistryProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html data-astryx-theme="neutral" lang="en">
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

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* The header is sticky, not fixed: it keeps its own 64px band and the
          page flows underneath without a phantom gap. */}
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
