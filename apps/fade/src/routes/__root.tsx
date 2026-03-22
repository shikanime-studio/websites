import type { ErrorComponentProps } from '@tanstack/react-router'
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
  errorComponent: RootErrorComponent,
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
function RootErrorComponent({ error }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error)

  return (
    <div className="bg-base-200 text-base-content flex min-h-screen items-center justify-center p-6">
      <div className="bg-base-100 border-base-300 w-full max-w-lg rounded-box border p-6 shadow">
        <h1 className="m-0 text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 mb-0 opacity-70">
          An unexpected error occurred while rendering this page.
        </p>
        <pre className="bg-base-200 mt-4 overflow-auto rounded-md p-3 text-sm opacity-80">
          {message}
        </pre>
        <div className="mt-4 flex justify-end">
          <button
            className="btn btn-warning"
            onClick={() => {
              window.location.reload()
            }}
          >
            Reload
          </button>
        </div>
      </div>
    </div>
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
