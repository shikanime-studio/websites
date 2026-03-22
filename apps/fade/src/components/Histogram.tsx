import type { FileItem } from '../lib/fs'
import { Suspense } from 'react'
import { useFile } from '../hooks/useFile'
import { useHistogram } from '../hooks/useHistogram'

interface HistogramProps {
  fileItem: FileItem
  className?: string
}

function HistogramSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md bg-zinc-800/50 ${className ?? ''}`}
    >
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
    </div>
  )
}

function HistogramContent({ className, fileItem }: HistogramProps) {
  const file = useFile(fileItem)
  const { data } = useHistogram(file)

  if (!data)
    return null

  return (
    <div
      className={`relative h-32 w-full overflow-hidden rounded-md bg-black ${className ?? ''}`}
    >
      <svg
        viewBox="0 0 256 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <g>
          <path
            d={`M0,100 ${data.r
              .map((v, i) => `L${i.toString()},${(100 - v).toString()}`)
              .join(' ')} L255,100 Z`}
            fill="#ff0000"
            className="opacity-80"
            style={{ mixBlendMode: 'screen' }}
          />
          <path
            d={`M0,100 ${data.g
              .map((v, i) => `L${i.toString()},${(100 - v).toString()}`)
              .join(' ')} L255,100 Z`}
            fill="#00ff00"
            className="opacity-80"
            style={{ mixBlendMode: 'screen' }}
          />
          <path
            d={`M0,100 ${data.b
              .map((v, i) => `L${i.toString()},${(100 - v).toString()}`)
              .join(' ')} L255,100 Z`}
            fill="#0000ff"
            className="opacity-80"
            style={{ mixBlendMode: 'screen' }}
          />
        </g>
      </svg>
    </div>
  )
}

export function Histogram({ className, fileItem }: HistogramProps) {
  return (
    <Suspense fallback={<HistogramSkeleton className={className} />}>
      <HistogramContent fileItem={fileItem} className={className} />
    </Suspense>
  )
}
