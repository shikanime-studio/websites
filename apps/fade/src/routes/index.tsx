import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { z } from 'zod'
import { DirectoryProvider } from '../components/DirectoryProvider'
import { Filmstrip } from '../components/Filmstrip'
import { GalleryProvider } from '../components/GalleryProvider'
import { GPUProvider } from '../components/GPUProvider'
import { ImageInfoProvider } from '../components/ImageInfoProvider'
import { LightingProvider } from '../components/LightingProvider'
import { MainViewer } from '../components/MainViewer'
import { ModalProvider } from '../components/ModalProvider'
import { Sidebar } from '../components/Sidebar'
import { ToolBar } from '../components/ToolBar'
import { useDirectory } from '../hooks/useDirectory'

export const Route = createFileRoute('/')({
  component: App,
  validateSearch: z.object({
    modal: z.enum(['settings', 'fullscreen']).optional(),
  }),
})

// eslint-disable-next-line react-refresh/only-export-components
function GalleryContainer() {
  const { handle } = useDirectory()

  return (
    <GalleryProvider handle={handle}>
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

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  return (
    <GPUProvider>
      <DirectoryProvider>
        <Suspense
          fallback={(
            <div className="flex h-screen items-center justify-center">
              <span className="loading loading-spinner loading-lg text-warning"></span>
            </div>
          )}
        >
          <ModalProvider navigate={navigate} search={search}>
            <GalleryContainer />
          </ModalProvider>
        </Suspense>
      </DirectoryProvider>
    </GPUProvider>
  )
}
