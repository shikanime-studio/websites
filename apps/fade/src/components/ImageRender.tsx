import { useImageRender } from '@shikanime-studio/medialab/hooks/image'
import { useId } from 'react'
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
  const canvasId = useId()
  const lighting = useLighting()

  useImageRender(canvasId, image, { lighting })

  return (
    <canvas
      id={canvasId}
      width={image.naturalWidth}
      height={image.naturalHeight}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  )
}
