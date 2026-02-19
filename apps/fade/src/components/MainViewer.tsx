import type { FileItem } from '../lib/fs'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { Activity, Suspense } from 'react'
import { useFile } from '../hooks/useFile'
import { useGallery } from '../hooks/useGallery'
import { ImageViewer } from './ImageViewer'
import { RawImageViewer } from './RawImageViewer'

export function MainViewer() {
  const { selectedFile, files, selectedIndex, navigateNext, navigatePrevious }
    = useGallery()

  if (files.length === 0) {
    return <EmptyMainViewer />
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

function EmptyMainViewer() {
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

interface MainViewerContentProps {
  fileItem?: FileItem
}

function MainViewerContent({ fileItem }: MainViewerContentProps) {
  const { mimeType } = useFile(fileItem ?? null)

  if (mimeType === 'image/x-fujifilm-raf') {
    return <RawImageViewer fileItem={fileItem ?? undefined} />
  }

  return <ImageViewer fileItem={fileItem ?? undefined} />
}
