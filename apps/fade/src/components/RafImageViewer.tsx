import type { FileItem } from '../lib/fs'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { Suspense, useMemo, useRef } from 'react'
import { useAutoSaver } from '../hooks/useAutoSaver'
import { useModal } from '../hooks/useModal'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { usePreview } from '../hooks/usePreview'
import { lightingDefaults, projectLightingCollection, projectsCollection } from '../lib/db'
import { FullscreenModal } from './FullscreenModal'
import { FullscreenNavigation } from './FullscreenNavigation'
import { RafImageRender } from './RafImageRender'

interface RafImageViewerProps {
  fileItem?: FileItem
}

function RafCanvasSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`${className ?? ''} flex items-center justify-center bg-zinc-800/50`}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" />
    </div>
  )
}

function RafPreviewImage({
  fileItem,
  className,
  onDoubleClick,
}: {
  fileItem: FileItem
  className?: string
  onDoubleClick?: () => void
}) {
  const { blob } = usePreview(fileItem)
  const { url } = useObjectUrl(blob)

  if (!url)
    return null

  return (
    <img
      src={url}
      alt={fileItem.handle.name}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  )
}

export function RafImageViewer({ fileItem }: RafImageViewerProps) {
  const { modal, setModal } = useModal()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const getOutputRef = useRef<(() => Promise<{ width: number, height: number, rgba16: Uint16Array } | null>) | null>(null)

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
    fileItem
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

  return (
    <>
      <Suspense
        fallback={
          <RafCanvasSkeleton className="aspect-square h-full max-h-full w-full max-w-full rounded-lg shadow-2xl" />
        }
      >
        {shouldSave
          ? (
              <RafImageRender
                fileItem={fileItem}
                lighting={lighting}
                canvasRef={canvasRef}
                onGetOutput={(getOutput) => {
                  getOutputRef.current = getOutput
                }}
                onDoubleClick={() => {
                  setModal('fullscreen')
                }}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
              />
            )
          : (
              fileItem && (
                <RafPreviewImage
                  fileItem={fileItem}
                  onDoubleClick={() => {
                    setModal('fullscreen')
                  }}
                  className="animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                />
              )
            )}
      </Suspense>
      <FullscreenModal
        open={modal === 'fullscreen'}
        onClose={() => {
          setModal(undefined)
        }}
      >
        <FullscreenNavigation>
          <Suspense
            fallback={
              <RafCanvasSkeleton className="h-full max-h-full w-full max-w-full" />
            }
          >
            {shouldSave
              ? (
                  <RafImageRender
                    fileItem={fileItem}
                    lighting={lighting}
                    onGetOutput={(getOutput) => {
                      getOutputRef.current = getOutput
                    }}
                    className="max-h-full max-w-full object-contain"
                  />
                )
              : (
                  fileItem && (
                    <RafPreviewImage
                      fileItem={fileItem}
                      className="animate-fade-in max-h-full max-w-full object-contain"
                    />
                  )
                )}
          </Suspense>
        </FullscreenNavigation>
      </FullscreenModal>
    </>
  )
}
