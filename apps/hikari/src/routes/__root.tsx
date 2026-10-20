import { Theme as AstryxTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
import { I18nProvider } from "../i18n";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AstryxTheme theme={neutralTheme} mode="system">
        <I18nProvider>
          <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-5xl grow px-4 pt-20 pb-12 lg:px-6">
              <Outlet />
            </main>
          </div>
        </I18nProvider>
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
