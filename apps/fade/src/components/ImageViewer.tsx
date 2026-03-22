import type { FileItem } from '../lib/fs'
import { Suspense } from 'react'
import { useFile } from '../hooks/useFile'
import { useModal } from '../hooks/useModal'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { FileIcon } from './FileIcon'
import { FullscreenModal } from './FullscreenModal'
import { FullscreenNavigation } from './FullscreenNavigation'
import { ImageRender } from './ImageRender'

interface ImageViewerProps {
  fileItem?: FileItem
}

export function ImageViewer({ fileItem }: ImageViewerProps) {
  const file = useFile(fileItem)
  const url = useObjectUrl(file)
  const { modal, setModal } = useModal()

  if (!file || !url)
    return null

  return (
    <>
      {fileItem?.mimeType?.startsWith('image/')
        ? (
            <>
              <div className="contents">
                <Suspense
                  fallback={(
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" />
                    </div>
                  )}
                >
                  <ImageRender
                    file={file}
                    className="animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                    onDoubleClick={() => {
                      setModal('fullscreen')
                    }}
                  />
                </Suspense>
              </div>
              <FullscreenModal
                open={modal === 'fullscreen'}
                onClose={() => {
                  setModal(undefined)
                }}
              >
                <FullscreenNavigation>
                  <Suspense
                    fallback={(
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" />
                      </div>
                    )}
                  >
                    <ImageRender
                      file={file}
                      className="max-h-full max-w-full object-contain"
                    />
                  </Suspense>
                </FullscreenNavigation>
              </FullscreenModal>
            </>
          )
        : fileItem?.mimeType?.startsWith('video/')
          ? (
              <video
                key={url}
                src={url}
                className="animate-fade-in max-h-full max-w-full rounded-lg shadow-2xl"
                controls
                autoPlay
                loop
              >
                <track kind="captions" />
              </video>
            )
          : (
              <object
                data={url}
                type={fileItem?.mimeType}
                className="animate-fade-in h-full w-full rounded-lg object-contain shadow-2xl"
              >
                <div className="flex h-full flex-col items-center justify-center gap-4 opacity-50">
                  <FileIcon type={fileItem?.mimeType} className="h-32 w-32 opacity-30" />
                  <p className="m-0 text-xl font-medium">
                    Preview not available for this file type
                  </p>
                </div>
              </object>
            )}
    </>
  )
}
