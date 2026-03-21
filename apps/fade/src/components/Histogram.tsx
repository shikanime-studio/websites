import type { HistogramBins } from '../lib/db'
import type { FileItem } from '../lib/fs'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { Suspense, useEffect } from 'react'
import { useHistogram } from '../hooks/useHistogram'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { usePreview } from '../hooks/usePreview'
import { projectImageInfoCollection, projectsCollection } from '../lib/db'

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

function HistogramContent({
  className,
  data,
}: HistogramProps & { data: HistogramBins }) {
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

function HistogramCompute({
  fileItem,
  className,
}: HistogramProps) {
  const fileName = fileItem.handle.name
  const { blob } = usePreview(fileItem)
  const { url } = useObjectUrl(blob ?? null)
  const computed = useHistogram(url ?? null)

  useEffect(() => {
    if (!computed)
      return

    const histogram: HistogramBins = {
      r: computed.r,
      g: computed.g,
      b: computed.b,
    }

    try {
      projectsCollection.update(fileName, (draft) => {
        draft.path = draft.path ?? fileName
      })
    }
    catch {
      projectsCollection.insert({
        id: fileName,
        path: fileName,
      })
    }
    try {
      projectImageInfoCollection.update(fileName, (draft) => {
        draft.width = draft.width ?? computed.width
        draft.height = draft.height ?? computed.height
        draft.histogram = histogram
      })
    }
    catch {
      projectImageInfoCollection.insert({
        id: fileName,
        width: computed.width,
        height: computed.height,
        histogram,
      })
    }
  }, [computed, fileName])

  if (!computed)
    return null

  return (
    <HistogramContent
      fileItem={fileItem}
      className={className}
      data={{ r: computed.r, g: computed.g, b: computed.b }}
    />
  )
}

export function Histogram({ className, fileItem }: HistogramProps) {
  const fileName = fileItem.handle.name

  const { data: imageInfo } = useLiveQuery(q =>
    q
      .from({ imageInfo: projectImageInfoCollection })
      .where(({ imageInfo }) => eq(imageInfo.id, fileName))
      .findOne(),
  )

  const stored = imageInfo?.histogram

  if (stored) {
    return <HistogramContent fileItem={fileItem} className={className} data={stored} />
  }

  return (
    <Suspense fallback={<HistogramSkeleton className={className} />}>
      <HistogramCompute fileItem={fileItem} className={className} />
    </Suspense>
  )
}
