import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'

export function useObjectUrl(blob?: Blob | MediaSource) {
  const queryClient = useQueryClient()
  const url = useMemo(() => {
    if (!blob)
      return undefined
    return URL.createObjectURL(blob)
  }, [blob])

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url)
        queryClient.invalidateQueries({ queryKey: ['object-url', blob] })
      }
    }
  }, [url, queryClient, blob])

  return url
}
