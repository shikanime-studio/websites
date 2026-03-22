import { useImageRender } from '@shikanime-studio/medialab/hooks/image'
import { useId } from 'react'
import { useImageBitmap } from '../hooks/useImageBitmap'
import { useLighting } from '../hooks/useLighting'

interface ImageRenderProps {
  file: File
  className?: string
  onDoubleClick?: () => void
}

export function ImageRender({
  file,
  className,
  onDoubleClick,
}: ImageRenderProps) {
  const bitmap = useImageBitmap(file)
  const canvasId = useId()
  const lighting = useLighting()

  useImageRender(canvasId, bitmap ?? undefined, { lighting })

  if (bitmap === null) {
    return (
      <div className="flex h-full w-full items-center justify-center opacity-50">
        Preview not available for this image
      </div>
    )
  }

  if (!bitmap || bitmap.width <= 0 || bitmap.height <= 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <canvas
      id={canvasId}
      width={bitmap.width}
      height={bitmap.height}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  )
}
