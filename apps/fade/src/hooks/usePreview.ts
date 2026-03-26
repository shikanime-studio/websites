import type { FileItem } from '../lib/fs'
import { RafDataView } from '@shikanime-studio/medialab'
import { useSuspenseQuery } from '@tanstack/react-query'
import { fileHandleKey } from '../lib/queryKey'

export function usePreview(fileItem: FileItem | null) {
  const handle = fileItem?.handle ?? null
  const mimeType = fileItem?.mimeType ?? null

  const { data: blob } = useSuspenseQuery({
    queryKey: ['preview', fileHandleKey(handle), mimeType],
    queryFn: async () => {
      if (!handle)
        return null

      const file = await handle.getFile()

      if (mimeType === 'image/x-fujifilm-raf') {
        const buffer = await file.arrayBuffer()
        const view = new RafDataView(buffer)
        const jpgView = view.getJpegImage()
        if (!jpgView)
          return null
        return new Blob([jpgView as unknown as BlobPart], {
          type: 'image/jpeg',
        })
      }

      return file
    },
    staleTime: Infinity,
  })

  return { blob }
}
