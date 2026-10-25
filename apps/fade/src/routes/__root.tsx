import { Theme as AstryxTheme } from "@astryxdesign/core/theme";
import { ToastViewport } from "@astryxdesign/core/Toast";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  ClientOnly,
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import appCss from "../assets/global.css?url";
import { MixpanelProvider } from "../components/MixpanelProvider";
import { useTheme } from "../hooks/useTheme";

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
        title: "Fade",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <MixpanelProvider
        token={import.meta.env.VITE_MIXPANEL_TOKEN}
        config={{
          autocapture: true,
          record_sessions_percent: 100,
          api_host: import.meta.env.VITE_MIXPANEL_API_HOST,
        }}
      >
        <ClientOnly>
          <AstryxSurface />
          <ToastViewport position="bottomEnd" maxVisible={4} />
        </ClientOnly>
      </MixpanelProvider>
  );
}

function AstryxSurface() {
  const { theme } = useTheme();

  return (
    <AstryxTheme theme={neutralTheme} mode={theme ?? "system"}>
      <Outlet />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
            defaultOpen: false,
          },
        ]}
      />
    </AstryxTheme>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
