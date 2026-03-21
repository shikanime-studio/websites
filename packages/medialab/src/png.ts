import { ExifDataView } from './exif'

export const Signature1Marker = 0x89504E47
export const Signature2Marker = 0x0D0A1A0A
export const ExifChunkMarker = 0x65584966

export class PngDataView<T extends ArrayBufferLike>
  extends DataView<T> {
  getExif(): ExifDataView<T> | null {
    let offset = 0

    if (
      this.byteLength > 7
      && this.getUint32(offset) === Signature1Marker
      && this.getUint32(offset + 4) === Signature2Marker
    ) {
      offset += 8
    }

    while (offset < this.byteLength) {
      if (offset + 8 > this.byteLength)
        break
      const chunkLength = this.getUint32(offset)

      if (this.getUint32(offset + 4) === ExifChunkMarker) {
        return new ExifDataView(
          this.buffer,
          this.byteOffset + offset + 8,
          chunkLength,
        )
      }

      offset += 12 + chunkLength
    }

    return null
  }
}
