import type { FileItem } from '../lib/fs'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useMemo, useRef, useState } from 'react'
import { useAutoSaver } from '../hooks/useAutoSaver'
import { useFile } from '../hooks/useFile'
import { useModal } from '../hooks/useModal'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { lightingDefaults, projectsCollection } from '../lib/db'
import { FullscreenModal } from './FullscreenModal'
import { FullscreenNavigation } from './FullscreenNavigation'
import { ImageRender } from './ImageRender'

interface ImageViewerProps {
  fileItem?: FileItem
}

export function ImageViewer({ fileItem }: ImageViewerProps) {
  const { file } = useFile(fileItem ?? null)
  const { url } = useObjectUrl(file ?? null)
  const { modal, setModal } = useModal()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const getOutputRef = useRef<(() => Promise<{ width: number, height: number, rgba16: Uint16Array } | null>) | null>(null)
  const [loadedImageState, setLoadedImageState] = useState<{ url: string, image: HTMLImageElement } | null>(null)

  const urlString = url ?? ''
  const loadedImage = loadedImageState?.url === urlString ? loadedImageState.image : null

  const fileName = fileItem?.handle.name ?? ''

  const { data: project } = useLiveQuery(q =>
    q
      .from({ projects: projectsCollection })
      .where(({ projects }) => eq(projects.id, fileName))
      .findOne(),
  )

  const lighting = project?.lighting ?? lightingDefaults
  const isRenderableImage = !!file && !!url && !!fileItem?.mimeType?.startsWith('image/')

  const shouldSave = useMemo(() => {
    return (
      isRenderableImage
      && !!fileItem
      && (
        lighting.exposure !== 0
        || lighting.contrast !== 1
        || lighting.saturation !== 1
        || lighting.highlights !== 0
        || lighting.shadows !== 0
        || lighting.whites !== 0
        || lighting.blacks !== 0
        || lighting.tint !== 0
        || lighting.temperature !== 0
        || lighting.vibrance !== 0
        || lighting.hue !== 0
      )
    )
  }, [
    isRenderableImage,
    fileItem,
    lighting.exposure,
    lighting.contrast,
    lighting.saturation,
    lighting.highlights,
    lighting.shadows,
    lighting.whites,
    lighting.blacks,
    lighting.tint,
    lighting.temperature,
    lighting.vibrance,
    lighting.hue,
  ])

  const signature = useMemo(() => {
    return [
      lighting.exposure,
      lighting.contrast,
      lighting.saturation,
      lighting.vibrance,
      lighting.highlights,
      lighting.shadows,
      lighting.whites,
      lighting.blacks,
      lighting.tint,
      lighting.temperature,
      lighting.hue,
    ]
      .map(v => v.toFixed(4))
      .join('|')
  }, [
    lighting.exposure,
    lighting.contrast,
    lighting.saturation,
    lighting.vibrance,
    lighting.highlights,
    lighting.shadows,
    lighting.whites,
    lighting.blacks,
    lighting.tint,
    lighting.temperature,
    lighting.hue,
  ])

  useAutoSaver({
    fileItem,
    signature,
    shouldSave,
    getOutput: async () => {
      return getOutputRef.current ? getOutputRef.current() : null
    },
  })

  if (!isRenderableImage)
    return null

  return (
    <>
      <ImagePreview
        key={urlString}
        url={urlString}
        fileItem={fileItem}
        className={shouldSave ? 'hidden' : 'animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl'}
        onDoubleClick={() => {
          setModal('fullscreen')
        }}
        onLoadImage={(img) => {
          setLoadedImageState({ url: urlString, image: img })
        }}
      />
      {shouldSave && (
        <div className="contents">
          {loadedImage
            ? (
                <ImageRender
                  image={loadedImage}
                  lighting={lighting}
                  canvasRef={canvasRef}
                  onGetOutput={(getOutput) => {
                    getOutputRef.current = getOutput
                  }}
                  className="animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                  onDoubleClick={() => {
                    setModal('fullscreen')
                  }}
                />
              )
            : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" />
                </div>
              )}
        </div>
      )}
      <FullscreenModal
        open={modal === 'fullscreen'}
        onClose={() => {
          setModal(undefined)
        }}
      >
        <FullscreenNavigation>
          {!shouldSave && (
            <ImagePreview
              key={`fullscreen:${urlString}`}
              url={urlString}
              fileItem={fileItem}
              className="animate-fade-in max-h-full max-w-full object-contain"
            />
          )}
          {shouldSave && loadedImage && (
            <ImageRender
              image={loadedImage}
              lighting={lighting}
              onGetOutput={(getOutput) => {
                getOutputRef.current = getOutput
              }}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </FullscreenNavigation>
      </FullscreenModal>
    </>
  )
}

function ImagePreview({
  url,
  fileItem,
  className,
  onDoubleClick,
  onLoadImage,
}: {
  url: string
  fileItem?: FileItem
  className?: string
  onDoubleClick?: () => void
  onLoadImage?: (img: HTMLImageElement) => void
}) {
  return (
    <img
      src={url}
      alt={fileItem?.handle.name}
      className={className}
      onDoubleClick={onDoubleClick}
      onLoad={(e) => {
        const img = e.currentTarget
        onLoadImage?.(img)

        const fileName = fileItem?.handle.name
        if (!fileName)
          return

        const info = {
          width: img.naturalWidth,
          height: img.naturalHeight,
        }

        try {
          projectsCollection.update(fileName, (draft) => {
            draft.imageInfo = {
              ...draft.imageInfo,
              ...info,
            }
          })
        }
        catch {
          projectsCollection.insert({
            id: fileName,
            imageInfo: info,
          })
        }
      }}
    />
  )
}
