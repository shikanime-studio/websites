import { useImageRender } from '@shikanime-studio/medialab/hooks/image'
import { useRef } from 'react'
import { useGPU } from '../hooks/useGPU'
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
  const { device, format } = useGPU()

  useImageRender(canvasRef, image, device, format, lighting)

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
