import { ExifDataView } from './exif'

export const SOIMarker = 0xFFD8
export const APP1Marker = 0xFFE1
export const ExifHeaderMarker = 0x45786966
export const ZeroMarker = 0x0000
export const PrefixMarker = 0xFF00

export class JpegDataView<T extends ArrayBufferLike>
  extends DataView<T> {
  getExif(): ExifDataView<T> | null {
    let offset = 0

    if (this.byteLength > 1 && this.getUint16(offset) === SOIMarker) {
      offset += 2
    }

    while (offset < this.byteLength) {
      if (offset + 1 >= this.byteLength)
        break
      const marker = this.getUint16(offset)
      offset += 2

      if (marker === APP1Marker) {
        if (offset + 1 >= this.byteLength)
          break
        const segmentLength = this.getUint16(offset)
        if (
          this.getUint32(offset + 2) === ExifHeaderMarker
          && this.getUint16(offset + 6) === ZeroMarker
        ) {
          return new ExifDataView(
            this.buffer,
            this.byteOffset + offset + 8,
            segmentLength - 8,
          )
        }
        offset += segmentLength
      }
      else {
        if ((marker & PrefixMarker) !== PrefixMarker)
          break
        if (offset + 1 >= this.byteLength)
          break
        const segmentLength = this.getUint16(offset)
        offset += segmentLength
      }
    }

    return null
  }
}
