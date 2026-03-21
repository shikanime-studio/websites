import type { FileItem } from '../lib/fs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useExif } from './useExif'

export function useFile(fileItem: FileItem | null) {
  const { data: file } = useSuspenseQuery({
    queryKey: ['file', fileItem, fileItem?.handle.name],
    queryFn: async () => {
      if (!fileItem)
        return null
      return await fileItem.handle.getFile()
    },
    staleTime: Infinity,
  })

  useExif(fileItem, Boolean(file))

  return { file }
}
