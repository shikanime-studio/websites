import type { FileItem } from './fs'
import { RafDataView } from './raf'

export async function createRawImageDataView(
  source: FileItem,
): Promise<RafDataView<ArrayBuffer> | null> {
  const file = await source.handle.getFile()
  switch (source.mimeType) {
    case 'image/x-fujifilm-raf':
      return new RafDataView(await file.arrayBuffer())
    default:
      return null
  }
}
