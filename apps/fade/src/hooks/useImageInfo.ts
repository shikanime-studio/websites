import { createContext, use } from 'react'

interface ImageInfoContextType {
  image: HTMLImageElement | null
  setImage: (image: HTMLImageElement | null) => void
}

export const ImageInfoContext = createContext<ImageInfoContextType | null>(
  null,
)

export function useImageInfo() {
  const context = use(ImageInfoContext)
  if (!context) {
    throw new Error('useImageInfo must be used within a ImageInfoProvider')
  }
  return context
}
