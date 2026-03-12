import type { FileItem } from '../../../apps/fade/src/lib/fs'
import { ExifDataView } from './exif'
import { JpegDataView } from './jpeg'
import { PngDataView } from './png'
import { TiffDataView } from './tiff'
import { WebPDataView } from './webp'

export interface ExifProvider {
  getExif: () => ExifDataView<ArrayBufferLike> | null
}

class TiffImageDataView<T extends ArrayBufferLike>
  extends TiffDataView<T>
  implements ExifProvider {
  getExif(): ExifDataView<T> | null {
    return new ExifDataView(this.buffer, this.byteOffset, this.byteLength)
  }
}

export async function createImageDataView(
  source: FileItem,
): Promise<ExifProvider | null> {
  const file = await source.handle.getFile()
  switch (source.mimeType) {
    case 'image/jpeg':
      return new JpegDataView(await file.arrayBuffer())
    case 'image/png':
      return new PngDataView(await file.arrayBuffer())
    case 'image/webp':
      return new WebPDataView(await file.arrayBuffer())
    case 'image/tiff':
      return new TiffImageDataView(await file.arrayBuffer())
    default:
      return null
  }
}
