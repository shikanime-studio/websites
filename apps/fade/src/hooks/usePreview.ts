import type { FileItem } from '../lib/fs'
import { RafDataView } from '@shikanime-studio/medialab'
import { useSuspenseQuery } from '@tanstack/react-query'
import { fileTypeFromBlob } from 'file-type'
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

      const detected = !mimeType ? await fileTypeFromBlob(file) : null
      const effectiveType = mimeType ?? detected?.mime ?? file.type ?? ''

      if (effectiveType === 'image/x-fujifilm-raf') {
        const buffer = await file.arrayBuffer()
        const view = new RafDataView(buffer)
        const jpgView = view.getJpegImage()
        if (!jpgView)
          return null
        return new Blob([jpgView as unknown as BlobPart], {
          type: 'image/jpeg',
        })
      }

      if (!file.type && effectiveType) {
        return file.slice(0, file.size, effectiveType)
      }

      return file
    },
    staleTime: Infinity,
  })

  return { blob }
}
