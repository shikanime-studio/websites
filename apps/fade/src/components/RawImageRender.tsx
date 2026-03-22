import type { FileItem } from '../lib/fs'
import { useRafImage, useRafRender } from '@shikanime-studio/medialab/hooks/raf'
import { useId } from 'react'
import { useLighting } from '../hooks/useLighting'

interface RawImageRenderProps {
  fileItem?: FileItem | undefined
  className?: string
  onDoubleClick?: () => void
}

export function RawImageRender({
  fileItem,
  className,
  onDoubleClick,
}: RawImageRenderProps) {
  const { data: cfa } = useRafImage(fileItem ?? null)
  const canvasId = useId()
  const lighting = useLighting()

  useRafRender(
    canvasId,
    cfa,
    { lighting },
  )

  return (
    <canvas
      id={canvasId}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  )
}
