import { useRef } from 'react'
import { useImageRender } from '../hooks/useImageRender'
import { useLighting } from '../hooks/useLighting'

interface ImageRenderProps {
  image: HTMLImageElement
  className?: string
  onDoubleClick?: () => void
}

export function ImageRender({
  image,
  className,
  onDoubleClick,
}: ImageRenderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lighting = useLighting()

  useImageRender(canvasRef, image, lighting)

  return (
    <canvas
      ref={canvasRef}
      width={image.naturalWidth}
      height={image.naturalHeight}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  )
}
