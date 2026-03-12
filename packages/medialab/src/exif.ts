import { TiffDataView } from './tiff'

export {
  AsciiExifType,
  BigEndianness,
  ByteExifType,
  type Endianness,
  type ExifType,
  isContainer,
  LittleEndianness,
  LongExifType,
  RationalExifType,
  ShortExifType,
  sizeOf,
  SLongExifType,
  SRationalExifType,
  TiffDataView,
} from './tiff'

export const MakeTagId = 0x010F
export const ModelTagId = 0x0110
export const ExifOffsetTagId = 0x8769
export const ExposureTimeTagId = 0x829A
export const FNumberTagId = 0x829D
export const ISOTagId = 0x8827
export const DateTimeOriginalTagId = 0x9003
export const FocalLengthTagId = 0x920A
export const LensModelTagId = 0xA433

export type ExifTagEntry
  = | { tagId: typeof MakeTagId, value: string }
    | { tagId: typeof ModelTagId, value: string }
    | { tagId: typeof ExifOffsetTagId, value: number }
    | { tagId: typeof ExposureTimeTagId, value: number }
    | { tagId: typeof FNumberTagId, value: number }
    | { tagId: typeof ISOTagId, value: number }
    | { tagId: typeof DateTimeOriginalTagId, value: string }
    | { tagId: typeof FocalLengthTagId, value: number }
    | { tagId: typeof LensModelTagId, value: string }
    | { tagId: number, value: unknown }

export class ExifDataView<T extends ArrayBufferLike> extends TiffDataView<T> {
  getTagEntries(): Array<ExifTagEntry> {
    const result: Array<ExifTagEntry> = []

    const littleEndian = this.getLittleEndian()
    const firstIfdOffset = this.getFirstIfdOffset(littleEndian)
    if (!firstIfdOffset)
      return result

    const ifdOffsetsToRead: Array<number> = [firstIfdOffset]
    const visited = new Set<number>()

    while (ifdOffsetsToRead.length > 0) {
      const currentIfdOffset = ifdOffsetsToRead.pop()
      if (currentIfdOffset === undefined)
        break
      if (visited.has(currentIfdOffset))
        continue
      visited.add(currentIfdOffset)

      const tags = this.getIfdEntries(currentIfdOffset, littleEndian)
      for (const tag of tags) {
        result.push(tag)

        if (tag.tagId === (ExifOffsetTagId as number) && typeof tag.value === 'number') {
          ifdOffsetsToRead.push(tag.value)
        }
      }
    }

    return result
  }
}
