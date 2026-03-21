import type { ExifDataView, ExifTagEntry } from '../exif'
import type { FileItem } from '../raf'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createImageDataView } from '../image'
import { RafDataView } from '../raf'
import { retryDelay } from './utils'

export function useExif(fileItem: FileItem | null) {
  return useSuspenseQuery({
    queryKey: ['exif', fileItem],
    queryFn: async (): Promise<Array<ExifTagEntry> | null> => {
      if (!fileItem)
        return null

      const view = await createImageDataView(fileItem)
      if (!view)
        return null

      let exifView: ExifDataView<ArrayBufferLike> | null = null
      if (view instanceof RafDataView) {
        const jpeg = view.getJpegImage()
        if (jpeg) {
          exifView = jpeg.getExif()
        }
      }
      else {
        exifView = view.getExif()
      }

      return exifView ? exifView.getTagEntries() : null
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}
