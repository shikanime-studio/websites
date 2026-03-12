import type { FileItem } from '../lib/fs'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useFile(fileItem: FileItem | null) {
  const { data: file } = useSuspenseQuery({
    queryKey: ['file', fileItem?.handle.name],
    queryFn: async () => {
      if (!fileItem)
        return null
      return await fileItem.handle.getFile()
    },
    staleTime: Infinity,
  })

  return {
    file,
    mimeType: fileItem?.mimeType,
  }
}
