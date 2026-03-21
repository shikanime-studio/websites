import type { FileItem } from '../lib/fs'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useMemo, useRef, useState } from 'react'
import { useAutoSaver } from '../hooks/useAutoSaver'
import { useDirectory } from '../hooks/useDirectory'
import { useFile } from '../hooks/useFile'
import { useModal } from '../hooks/useModal'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { lightingDefaults, projectImageInfoCollection, projectLightingCollection, projectsCollection } from '../lib/db'
import { FileIcon } from './FileIcon'
import { FullscreenModal } from './FullscreenModal'
import { FullscreenNavigation } from './FullscreenNavigation'
import { ImageRender } from './ImageRender'

interface ImageViewerProps {
  fileItem?: FileItem
}

export function ImageViewer({ fileItem }: ImageViewerProps) {
  const { handle: directoryHandle } = useDirectory()
  const { file } = useFile(fileItem ?? null)
  const { url } = useObjectUrl(file ?? null)
  const { modal, setModal } = useModal()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const getOutputRef = useRef<
    (() => Promise<{ width: number, height: number, rgba16: Uint16Array } | null>) | null
  >(null)

  const urlString = url ?? ''
  const [loadedImageState, setLoadedImageState] = useState<{
    url: string
    image: HTMLImageElement
  } | null>(null)

  const loadedImage = loadedImageState?.url === urlString ? loadedImageState.image : null
  const fileName = fileItem?.handle.name ?? ''

  const { data: lightingRow } = useLiveQuery(
    q =>
      q
        .from({ lighting: projectLightingCollection })
        .where(({ lighting }) => eq(lighting.id, fileName))
        .findOne(),
    [fileName],
  )

  const lighting = {
    exposure: lightingRow?.exposure ?? lightingDefaults.exposure,
    contrast: lightingRow?.contrast ?? lightingDefaults.contrast,
    saturation: lightingRow?.saturation ?? lightingDefaults.saturation,
    highlights: lightingRow?.highlights ?? lightingDefaults.highlights,
    shadows: lightingRow?.shadows ?? lightingDefaults.shadows,
    whites: lightingRow?.whites ?? lightingDefaults.whites,
    blacks: lightingRow?.blacks ?? lightingDefaults.blacks,
    tint: lightingRow?.tint ?? lightingDefaults.tint,
    temperature: lightingRow?.temperature ?? lightingDefaults.temperature,
    vibrance: lightingRow?.vibrance ?? lightingDefaults.vibrance,
    hue: lightingRow?.hue ?? lightingDefaults.hue,
  }

  const { data: project } = useLiveQuery(
    q =>
      q
        .from({ project: projectsCollection })
        .where(({ project }) => eq(project.id, fileName))
        .findOne(),
    [fileName],
  )

  const shouldSave = Boolean(
    fileItem?.mimeType?.startsWith('image/')
    && urlString
    && project?.createdAt
    && project?.updatedAt
    && project.updatedAt !== project.createdAt,
  )

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

  if (!fileItem || !fileItem.mimeType?.startsWith('image/')) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 opacity-50">
        <FileIcon type={fileItem?.mimeType} className="h-16 w-16 opacity-30" />
        <p className="m-0 text-xl font-medium">Preview not available</p>
      </div>
    )
  }

  if (!file || !urlString) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <ImagePreview
        key={urlString}
        url={urlString}
        fileItem={fileItem}
        className={
          shouldSave
            ? 'hidden'
            : 'animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl'
        }
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

        const fullPath = directoryHandle ? `${directoryHandle.name}/${fileName}` : fileName
        try {
          projectsCollection.update(fileName, (draft) => {
            draft.path = fullPath
          })
        }
        catch {
          projectsCollection.insert({
            id: fileName,
            path: fullPath,
          })
        }
        try {
          projectImageInfoCollection.update(fileName, (draft) => {
            draft.width = info.width
            draft.height = info.height
          })
        }
        catch {
          projectImageInfoCollection.insert({
            id: fileName,
            width: info.width,
            height: info.height,
          })
        }
      }}
    />
  )
}
