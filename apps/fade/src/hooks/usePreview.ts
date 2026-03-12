import type { FileItem } from '../lib/fs'
import { RafDataView } from '@shikanime-studio/medialab/raf'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useFile } from './useFile'

export function usePreview(fileItem: FileItem | null) {
  const { file } = useFile(fileItem)

  const { data: blob } = useSuspenseQuery({
    queryKey: ['preview', file?.name, file?.lastModified, file, fileItem?.mimeType],
    queryFn: async () => {
      if (!file)
        return null

      if (fileItem?.mimeType === 'image/x-fujifilm-raf') {
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
