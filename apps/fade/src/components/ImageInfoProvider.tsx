import type { ReactNode } from 'react'
import { useState } from 'react'
import { ImageInfoContext } from '../hooks/useImageInfo'

export function ImageInfoProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  return (
    <ImageInfoContext
      value={{
        image,
        setImage,
      }}
    >
      {children}
    </ImageInfoContext>
  )
}
