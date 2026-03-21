import { ExifDataView } from './exif'

export const RiffMarker = 0x52494646
export const WebPMarker = 0x57454250
export const ExifMarker = 0x45584946

export class WebPDataView<T extends ArrayBufferLike>
  extends DataView<T> {
  getExif(): ExifDataView<T> | null {
    let offset = 0

    if (
      this.byteLength > 11
      && this.getUint32(offset) === RiffMarker
      && this.getUint32(offset + 8) === WebPMarker
    ) {
      offset += 12
    }

    while (offset < this.byteLength) {
      if (offset + 8 > this.byteLength)
        break
      const chunkId = this.getUint32(offset)
      const chunkLength = this.getUint32(offset + 4, true)

      if (chunkId === ExifMarker) {
        return new ExifDataView(
          this.buffer,
          this.byteOffset + offset + 8,
          chunkLength,
        )
      }

      offset += 8 + chunkLength
      if (chunkLength % 2 !== 0) {
        offset += 1
      }
    }

    return null
  }
}
