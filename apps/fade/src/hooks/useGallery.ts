import type { FileItem } from '../lib/fs'
import { createContext } from 'react'

export interface GalleryState {
  files: Array<FileItem>
  selectedIndex: number
}

export interface GalleryContextValue extends GalleryState {
  selectFile: (index: number) => void
  navigateNext: () => void
  navigatePrevious: () => void
  selectedFile: FileItem | null
}

export const GalleryContext = createContext<GalleryContextValue | null>(null)

export function useGallery() {
  const context = use(GalleryContext)
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider')
  }
  return context
}
