import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import {
  ClientOnly,
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { MixpanelProvider } from '../components/MixpanelProvider'
import { ThemeProvider } from '../components/ThemeProvider'
import appCss from '../styles.css?url'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Fade',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

// eslint-disable-next-line react-refresh/only-export-components
function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <MixpanelProvider
        token={import.meta.env.VITE_MIXPANEL_TOKEN}
        config={{
          autocapture: true,
          record_sessions_percent: 100,
          api_host: import.meta.env.VITE_MIXPANEL_API_HOST,
        }}
      >
        <ClientOnly>
          <ThemeProvider>
            <Outlet />
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'TanStack Query',
                  render: <ReactQueryDevtoolsPanel />,
                  defaultOpen: true,
                },
                {
                  name: 'TanStack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                  defaultOpen: false,
                },
              ]}
            />
          </ThemeProvider>
        </ClientOnly>
      </MixpanelProvider>
    </QueryClientProvider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
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
  )
}
