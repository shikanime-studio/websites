import type { FileItem } from '../lib/fs'
import { useEffect, useState } from 'react'
import { useFile } from '../hooks/useFile'
import { useImageInfo } from '../hooks/useImageInfo'
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
  const { file } = useFile(fileItem ?? null)
  const { url } = useObjectUrl(file ?? null)
  const { setImage } = useImageInfo()
  const { modal, setModal } = useModal()
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null)
  const [decodeError, setDecodeError] = useState(false)
  const [decodeErrorMessage, setDecodeErrorMessage] = useState<string | null>(null)
  const [prevUrl, setPrevUrl] = useState<string | null>(null)

  if (url !== prevUrl) {
    setPrevUrl(url ?? null)
    setLoadedImage(null)
    setDecodeError(false)
  }

  useEffect(() => {
    if (!file || !url || !(fileItem?.mimeType?.startsWith('image/') ?? false)) {
      setImage(null)
    }
  }, [file, url, fileItem?.mimeType, setImage])

  if (!file || !url)
    return null

  let content: React.ReactNode
  if (decodeError) {
    content = (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 opacity-50">
          <FileIcon type={fileItem?.mimeType} className="h-32 w-32 opacity-30" />
          <p className="m-0 text-base font-medium">Preview not available for this image format</p>
          {decodeErrorMessage && (
            <p className="m-0 max-w-[60ch] break-words text-sm opacity-70">{decodeErrorMessage}</p>
          )}
        </div>
      </div>
    )
  }
  else if (loadedImage) {
    content = (
      <ImageRender
        image={loadedImage}
        className="animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        onDoubleClick={() => {
          setModal('fullscreen')
        }}
      />
    )
  }
  else {
    content = (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      {fileItem?.mimeType?.startsWith('image/')
        ? (
            <>
              <img
                src={url}
                alt={fileItem?.handle.name}
                className="hidden"
                onLoad={(e) => {
                  const img = e.currentTarget
                  setLoadedImage(img)
                  setImage(img)
                }}
                onError={async () => {
                  setLoadedImage(null)
                  setDecodeError(true)
                  setDecodeErrorMessage(null)
                  try {
                    const resp = await fetch(url)
                    const blob = await resp.blob()
                    try {
                      const bmp = await createImageBitmap(blob)
                      bmp.close()
                    }
                    catch (err) {
                      const msg
                        = err instanceof Error
                          ? err.message
                          : typeof err === 'string'
                            ? err
                            : 'Image decode failed'
                      setDecodeErrorMessage(msg)
                    }
                  }
                  catch {
                    setDecodeErrorMessage('Image fetch failed')
                  }
                  setImage(null)
                }}
              />
              <div className="contents">
                {content}
              </div>
              <FullscreenModal
                open={modal === 'fullscreen'}
                onClose={() => {
                  setModal(undefined)
                }}
              >
                <FullscreenNavigation>
                  {loadedImage && !decodeError && (
                    <ImageRender
                      image={loadedImage}
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
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
