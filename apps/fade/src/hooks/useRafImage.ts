import type { FileItem } from '../lib/fs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createRafDataView, DimensionsTagId } from '../lib/raf'

export function useRafImage(fileItem: FileItem | null) {
  return useSuspenseQuery({
    queryKey: ['raf-image', fileItem, fileItem?.handle.name],
    queryFn: async () => {
      if (!fileItem)
        return null

      const view = await createRafDataView(fileItem)
      if (!view)
        return null

      const cfa = view.getCfa()
      const payload = cfa.getPayload()
      if (!payload)
        return null

      const header = cfa.getHeader()
      const tags = header?.getTagEntries() ?? []
      const dimEntry = tags.find(t => t.tagId === (DimensionsTagId as number))

      let width = 0
      let height = 0
      if (dimEntry && Array.isArray(dimEntry.value)) {
        ;[height, width] = dimEntry.value as [number, number]
      }

      const bytes = new Uint8Array(
        payload.buffer as ArrayBuffer,
        payload.byteOffset,
        payload.byteLength,
      )

      return {
        width,
        height,
        payload: new Uint8Array(bytes),
      }
    },
    staleTime: Infinity,
  })
}
