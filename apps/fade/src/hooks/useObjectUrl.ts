import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

export function useObjectUrl(blob: Blob | MediaSource | null) {
  const result = useSuspenseQuery({
    queryKey: ['objectUrl', blob],
    queryFn: () => {
      if (!blob)
        return undefined
      return URL.createObjectURL(blob)
    },
    staleTime: 0,
    gcTime: 0,
  })

  useEffect(() => {
    return () => {
      if (result.data) {
        URL.revokeObjectURL(result.data)
      }
    }
  }, [result.data])

  return result
}
