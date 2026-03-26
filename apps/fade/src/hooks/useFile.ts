import type { FileItem } from '../lib/fs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { fileHandleKey } from '../lib/queryKey'

export function useFile(fileItem: FileItem | null) {
  const handle = fileItem?.handle ?? null
  const { data: file } = useSuspenseQuery({
    queryKey: ['file', fileHandleKey(handle)],
    queryFn: async () => {
      if (!handle)
        return null
      return await handle.getFile()
    },
    staleTime: Infinity,
  })

  return { file }
}
