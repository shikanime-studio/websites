import type { FileItem } from '../lib/fs'
import { useRafImage, useRafRender } from '@shikanime-studio/medialab/hooks/raf'
import { useRef } from 'react'
import { useGPU } from '../hooks/useGPU'
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lighting = useLighting()
  const { device, format } = useGPU()

  useRafRender(
    canvasRef,
    cfa,
    device,
    format,
    { lighting },
  )

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  )
}
