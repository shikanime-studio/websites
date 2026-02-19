import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useGallery } from '../hooks/useGallery'
import { useModal } from '../hooks/useModal'

interface FullscreenNavigationProps {
  children: ReactNode
}

export function FullscreenNavigation({ children }: FullscreenNavigationProps) {
  const { navigateNext, navigatePrevious, files } = useGallery()
  const { setModal } = useModal()

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setModal(undefined)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setModal(undefined)
        }
      }}
    >
      {files.length > 1 && (
        <button
          className="btn btn-circle btn-ghost absolute left-4 z-50 text-white"
          onClick={(e) => {
            e.stopPropagation()
            navigatePrevious()
          }}
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}
      {children}
      {files.length > 1 && (
        <button
          className="btn btn-circle btn-ghost absolute right-4 z-50 text-white"
          onClick={(e) => {
            e.stopPropagation()
            navigateNext()
          }}
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}
    </div>
  )
}
