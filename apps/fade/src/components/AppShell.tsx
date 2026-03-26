import type { NavigateOptions } from '@tanstack/react-router'
import type { ModalType } from '../hooks/useModal'
import { Filmstrip } from './Filmstrip'
import { GalleryProvider } from './GalleryProvider'
import { ImageInfoProvider } from './ImageInfoProvider'
import { LightingProvider } from './LightingProvider'
import { MainViewer } from './MainViewer'
import { ModalProvider } from './ModalProvider'
import { Sidebar } from './Sidebar'
import { ToolBar } from './ToolBar'

export function AppShell({
  navigate,
  search,
}: {
  navigate: (opts: NavigateOptions) => Promise<void>
  search: { modal?: ModalType }
}) {
  return (
    <ModalProvider navigate={navigate} search={search}>
      <GalleryProvider>
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
    </ModalProvider>
  )
}
