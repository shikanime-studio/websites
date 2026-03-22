import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

export function useImageBitmap(file?: File) {
  const queryClient = useQueryClient()
  const fileKey = file
    ? `${file.name}:${file.size.toString()}:${file.lastModified.toString()}:${file.type}`
    : undefined
  const result = useSuspenseQuery({
    queryKey: ['image-bitmap', fileKey, file],
    queryFn: async ({ queryKey }): Promise<ImageBitmap | null | undefined> => {
      const file = queryKey[2] as File | undefined
      if (!file)
        return null
      try {
        return await createImageBitmap(file)
      }
      catch {
        return null
      }
    },
    staleTime: Infinity,
    gcTime: 0,
  })

  useEffect(() => {
    return () => {
      result.data?.close()
      queryClient.invalidateQueries({ queryKey: ['image-bitmap', fileKey, file] })
    }
  }, [result.data, queryClient, fileKey, file])

  return result.data
}
