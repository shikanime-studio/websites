import type { FileItem } from '../lib/fs'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { Activity, Suspense } from 'react'
import { useFile } from '../hooks/useFile'
import { useGallery } from '../hooks/useGallery'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { FileIcon } from './FileIcon'
import { ImageViewer } from './ImageViewer'
import { RafImageViewer } from './RafImageViewer'

export function MediaViewer() {
  const { selectedFile, files, selectedIndex, navigateNext, navigatePrevious }
    = useGallery()

  if (files.length === 0) {
    return <EmptyMediaViewer />
  }

  const canGoPrevious = selectedIndex > 0
  const canGoNext = selectedIndex < files.length - 1

  return (
    <div className="bg-base-100 relative flex min-w-0 flex-1 items-center justify-center">
      <button
        className="btn btn-circle btn-ghost absolute left-4 z-10 h-12 w-12"
        onClick={navigatePrevious}
        disabled={!canGoPrevious}
        aria-label="Previous file"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      <div className="flex h-full min-w-0 flex-1 items-center justify-center p-6">
        <Suspense
          fallback={
            <span className="loading loading-spinner loading-lg"></span>
          }
        >
          <Activity mode={selectedFile ? 'visible' : 'hidden'}>
            <MainViewerContent fileItem={selectedFile ?? undefined} />
          </Activity>
        </Suspense>
      </div>

      <button
        className="btn btn-circle btn-ghost absolute right-4 z-10 h-12 w-12"
        onClick={navigateNext}
        disabled={!canGoNext}
        aria-label="Next file"
      >
        <ChevronRight className="h-8 w-8" />
      </button>
    </div>
  )
}

function EmptyMediaViewer() {
  return (
    <div className="bg-base-200/50 relative flex min-w-0 flex-1 flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 opacity-50">
        <ImageOff className="h-16 w-16 opacity-30" />
        <p className="m-0 text-base font-medium">No files loaded</p>
        <p className="m-0 text-sm opacity-70">
          Click &quot;Open Folder&quot; to select a directory
        </p>
      </div>
    </div>
  )
}

interface MediaViewerContentProps {
  fileItem?: FileItem
}

function MainViewerContent({ fileItem }: MediaViewerContentProps) {
  if (fileItem?.mimeType === 'image/x-fujifilm-raf') {
    return <RafImageViewer fileItem={fileItem ?? undefined} />
  }

  if (fileItem?.mimeType?.startsWith('image/')) {
    return <ImageViewer fileItem={fileItem ?? undefined} />
  }

  return <ObjectURLViewer fileItem={fileItem ?? undefined} />
}

function ObjectURLViewer({ fileItem }: MediaViewerContentProps) {
  const { file } = useFile(fileItem ?? null)
  const { url } = useObjectUrl(file ?? null)

  if (!file || !url)
    return <EmptyMediaViewer />

  if (fileItem?.mimeType?.startsWith('video/')) {
    return <VideoViewer url={url} />
  }

  return <ObjectViewer url={url} mimeType={fileItem?.mimeType} />
}

function VideoViewer({ url }: { url: string }) {
  return (
    <video
      key={url}
      src={url}
      className="animate-fade-in max-h-full max-w-full rounded-lg shadow-2xl"
      controls
      autoPlay
      loop
    >
      <track kind="captions" />
    </video>
  )
}

function ObjectViewer({ url, mimeType }: { url: string, mimeType?: string }) {
  return (
    <object
      data={url}
      type={mimeType}
      className="animate-fade-in h-full w-full rounded-lg object-contain shadow-2xl"
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 opacity-50">
        <FileIcon type={mimeType} className="h-32 w-32 opacity-30" />
        <p className="m-0 text-xl font-medium">
          Preview not available for this file type
        </p>
      </div>
    </object>
  )
}
