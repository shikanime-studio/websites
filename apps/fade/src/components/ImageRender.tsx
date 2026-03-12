import type { RefObject } from 'react'
import type { LightingEdits } from '../lib/db'
import { useRef } from 'react'
import { useImageRender } from '../hooks/useImageRender'

interface ImageRenderProps {
  image: HTMLImageElement
  lighting: LightingEdits
  className?: string
  onDoubleClick?: () => void
  canvasRef?: RefObject<HTMLCanvasElement | null>
  onGetOutput?: (getOutput: (() => Promise<{ width: number, height: number, rgba16: Uint16Array } | null>) | null) => void
}

export function ImageRender({
  image,
  lighting,
  className,
  onDoubleClick,
  canvasRef,
  onGetOutput,
}: ImageRenderProps) {
  const localCanvasRef = useRef<HTMLCanvasElement>(null)
  const targetCanvasRef = canvasRef ?? localCanvasRef

  const { getOutput } = useImageRender(targetCanvasRef, image, lighting)

  if (onGetOutput)
    onGetOutput(getOutput)

  return (
    <canvas
      ref={targetCanvasRef}
      width={image.naturalWidth}
      height={image.naturalHeight}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  )
}
