import type { FileItem } from '../lib/fs'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { Suspense, useMemo, useRef } from 'react'
import { useAutoSaver } from '../hooks/useAutoSaver'
import { useModal } from '../hooks/useModal'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { usePreview } from '../hooks/usePreview'
import { lightingDefaults, projectsCollection } from '../lib/db'
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

  const { data: project } = useLiveQuery(q =>
    q
      .from({ projects: projectsCollection })
      .where(({ projects }) => eq(projects.id, fileName))
      .findOne(),
  )

  const lighting = project?.lighting ?? lightingDefaults

  const shouldSave = useMemo(() => {
    return (
      !!fileItem
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
