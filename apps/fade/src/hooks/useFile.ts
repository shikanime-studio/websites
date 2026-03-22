import type { FileItem } from '../lib/fs'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useFile(fileItem?: FileItem) {
  const { data: file } = useSuspenseQuery({
    queryKey: ['file', fileItem],
    queryFn: async () => {
      if (!fileItem)
        return null
      return await fileItem.handle.getFile()
    },
    staleTime: Infinity,
  })

  return file ?? undefined
}
