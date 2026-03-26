import type { NavigateOptions } from '@tanstack/react-router'
import type { ModalType } from '../hooks/useModal'
import { useFileSystem } from '@shikanime-studio/vfs/hooks'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { z } from 'zod'
import { Filmstrip } from '../components/Filmstrip'
import { GalleryProvider } from '../components/GalleryProvider'
import { ImageInfoProvider } from '../components/ImageInfoProvider'
import { LightingProvider } from '../components/LightingProvider'
import { MainViewer } from '../components/MainViewer'
import { ModalProvider } from '../components/ModalProvider'
import { Sidebar } from '../components/Sidebar'
import { ToolBar } from '../components/ToolBar'

export const Route = createFileRoute('/')({
  component: IndexRouteComponent,
  validateSearch: z.object({
    modal: z.enum(['settings', 'fullscreen']).optional(),
  }),
})

function GalleryContainer({
  selectedPath,
  setSelectedPath,
}: {
  selectedPath: string | undefined
  setSelectedPath: (path?: string, opts?: { replace?: boolean }) => void
}) {
  const { root } = useFileSystem()

  return (
    <GalleryProvider
      handle={root}
      selectedPath={selectedPath}
      setSelectedPath={setSelectedPath}
    >
      <div className="bg-base-100 text-base-content selection:bg-warning selection:text-warning-content flex h-screen flex-col">
        <ToolBar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <ImageInfoProvider>
            <LightingProvider>
              <MainViewer />
              <Sidebar />
            </LightingProvider>
          </ImageInfoProvider>
        </div>
        <Filmstrip />
      </div>
    </GalleryProvider>
  )
}

export function AppShell({
  navigate,
  search,
  selectedPath,
}: {
  navigate: (opts: NavigateOptions) => Promise<void>
  search: { modal?: ModalType }
  selectedPath?: string
}) {
  const setSelectedPath = useCallback(
    (path?: string, opts?: { replace?: boolean }) => {
      const replace = opts?.replace

      if (!path) {
        void navigate({
          to: '/',
          ...(replace === undefined ? {} : { replace }),
          search: prev => prev,
        })
        return
      }

      void navigate({
        to: '/$path',
        params: { path },
        ...(replace === undefined ? {} : { replace }),
        search: prev => prev,
      })
    },
    [navigate],
  )

  return (
    <ModalProvider navigate={navigate} search={search}>
      <GalleryContainer
        selectedPath={selectedPath}
        setSelectedPath={setSelectedPath}
      />
    </ModalProvider>
  )
}

function IndexRouteComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  return <AppShell navigate={navigate} search={search} />
}
