import type { RefObject } from 'react'
import type { LightingEdits } from '../lib/db'
import type { FileItem } from '../lib/fs'
import { useEffect, useRef } from 'react'
import { useRafImage } from '../hooks/useRafImage'
import { useRafImageRender } from '../hooks/useRafImageRender'
import { projectsCollection } from '../lib/db'

interface RafImageRenderProps {
  fileItem?: FileItem | undefined
  lighting: LightingEdits
  className?: string
  onDoubleClick?: () => void
  canvasRef?: RefObject<HTMLCanvasElement | null>
  onGetOutput?: (getOutput: (() => Promise<{ width: number, height: number, rgba16: Uint16Array } | null>) | null) => void
}

export function RafImageRender({
  fileItem,
  lighting,
  className,
  onDoubleClick,
  canvasRef,
  onGetOutput,
}: RafImageRenderProps) {
  const { data: rafData } = useRafImage(fileItem ?? null)
  const localCanvasRef = useRef<HTMLCanvasElement>(null)
  const targetCanvasRef = canvasRef ?? localCanvasRef

  const width = rafData?.width ?? 0
  const height = rafData?.height ?? 0
  const payload = rafData?.payload ?? new Uint8Array(0)

  useEffect(() => {
    const fileName = fileItem?.handle.name
    if (!fileName || width === 0 || height === 0)
      return

    try {
      projectsCollection.update(fileName, (draft) => {
        draft.imageInfo = {
          ...draft.imageInfo,
          width,
          height,
        }
      })
    }
    catch {
      projectsCollection.insert({
        id: fileName,
        imageInfo: {
          width,
          height,
        },
      })
    }
  }, [fileItem, height, width])

  const { getOutput } = useRafImageRender(
    targetCanvasRef,
    width,
    height,
    payload,
    lighting,
  )

  if (onGetOutput)
    onGetOutput(getOutput)

  return (
    <canvas
      ref={targetCanvasRef}
      width={width || undefined}
      height={height || undefined}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  )
}
