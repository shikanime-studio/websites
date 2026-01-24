export const LittleEndianness = 0x4949; // 'II'
export const BigEndianness = 0x4d4d; // 'MM'

export type Endianness = typeof LittleEndianness | typeof BigEndianness;

export const ByteExifType = 1;
export const AsciiExifType = 2;
export const ShortExifType = 3;
export const LongExifType = 4;
export const RationalExifType = 5;
export const SLongExifType = 9;
export const SRationalExifType = 10;

export type ExifType =
  | typeof ByteExifType
  | typeof AsciiExifType
  | typeof ShortExifType
  | typeof LongExifType
  | typeof RationalExifType
  | typeof SLongExifType
  | typeof SRationalExifType;

export const MakeTagId = 0x010f;
export const ModelTagId = 0x0110;
export const ExifOffsetTagId = 0x8769;
export const ExposureTimeTagId = 0x829a;
export const FNumberTagId = 0x829d;
export const ISOTagId = 0x8827;
export const DateTimeOriginalTagId = 0x9003;
export const FocalLengthTagId = 0x920a;
export const LensModelTagId = 0xa433;

export type ExifTagId =
  | typeof MakeTagId
  | typeof ModelTagId
  | typeof ExifOffsetTagId
  | typeof ExposureTimeTagId
  | typeof FNumberTagId
  | typeof ISOTagId
  | typeof DateTimeOriginalTagId
  | typeof FocalLengthTagId
  | typeof LensModelTagId;

export type ExifTagEntry =
  | { tagId: typeof MakeTagId; value: string }
  | { tagId: typeof ModelTagId; value: string }
  | { tagId: typeof ExifOffsetTagId; value: number }
  | { tagId: typeof ExposureTimeTagId; value: number }
  | { tagId: typeof FNumberTagId; value: number }
  | { tagId: typeof ISOTagId; value: number }
  | { tagId: typeof DateTimeOriginalTagId; value: string }
  | { tagId: typeof FocalLengthTagId; value: number }
  | { tagId: typeof LensModelTagId; value: string }
  | { tagId: number; value: unknown };

export function sizeOf(type: ExifType): number {
  switch (type) {
    case ByteExifType:
    case AsciiExifType:
      return 1;
    case ShortExifType:
      return 2;
    case LongExifType:
    case SLongExifType:
      return 4;
    case RationalExifType:
    case SRationalExifType:
      return 8;
    default:
      return 0;
  }
}

export function isContainer(type: ExifType) {
  return type === AsciiExifType || type === ByteExifType;
}

export class ExifDataView<T extends ArrayBufferLike> extends DataView<T> {
  getAscii(offset: number, length: number): string {
    let str = "";
    for (let i = 0; i < length; i++) {
      const charCode = this.getUint8(offset + i);
      if (charCode === 0) break;
      str += String.fromCharCode(charCode);
    }
    return str.trim();
  }

  getRational(offset: number, littleEndian?: boolean): number {
    const numerator = this.getUint32(offset, littleEndian);
    const denominator = this.getUint32(offset + 4, littleEndian);
    return numerator / denominator;
  }

  getSRational(offset: number, littleEndian?: boolean): number {
    const sNumerator = this.getInt32(offset, littleEndian);
    const sDenominator = this.getInt32(offset + 4, littleEndian);
    return sNumerator / sDenominator;
  }

  isLittleEndian() {
    return this.getUint16(0, true) === LittleEndianness.valueOf();
  }

  getTagHeader(offset: number, littleEndian?: boolean) {
    return {
      tagId: this.getUint16(offset, littleEndian),
      type: this.getUint16(offset + 2, littleEndian) as ExifType,
      count: this.getUint32(offset + 4, littleEndian),
    };
  }

  getValue(offset: number, type: ExifType, littleEndian?: boolean) {
    switch (type) {
      case ShortExifType:
        return this.getUint16(offset, littleEndian);
      case LongExifType:
        return this.getUint32(offset, littleEndian);
      case RationalExifType:
        return this.getRational(offset, littleEndian);
      case SRationalExifType:
        return this.getSRational(offset, littleEndian);
      default:
        return null;
    }
  }

  getContainer(offset: number, type: ExifType, count: number) {
    switch (type) {
      case AsciiExifType:
        return this.getAscii(offset, count);
      case ByteExifType:
        return this.buffer.slice(
          this.byteOffset + offset,
          this.byteOffset + offset + count,
        );
      default:
        return null;
    }
  }

  getTagEntry(offset: number, littleEndian?: boolean) {
    const { tagId, type, count } = this.getTagHeader(offset, littleEndian);
    const typeSize = sizeOf(type);
    const totalSize = typeSize * count;

    let valueOffset = offset + 8;
    if (totalSize > 4) {
      valueOffset = this.getUint32(offset + 8, littleEndian);
    }

    const value = isContainer(type)
      ? this.getContainer(valueOffset, type, count)
      : this.getValue(valueOffset, type, littleEndian);

    return {
      tagId,
      value,
    };
  }

  getTagEntries(): Array<ExifTagEntry> {
    const result: Array<ExifTagEntry> = [];

    // Check byte order
    const littleEndian = this.isLittleEndian();

    // First IFD offset
    const firstIfdOffset = this.getUint32(4, littleEndian);
    if (firstIfdOffset < 8) return result;

    const ifdOffsetsToRead: Array<number> = [firstIfdOffset];

    while (ifdOffsetsToRead.length > 0) {
      const currentIfdOffset = ifdOffsetsToRead.pop();
      if (currentIfdOffset === undefined) break;

      const entryCount = this.getUint16(currentIfdOffset, littleEndian);
      for (let i = 0; i < entryCount; i++) {
        const tagOffset = currentIfdOffset + 2 + i * 12;
        const tag = this.getTagEntry(tagOffset, littleEndian);
        result.push(tag);

        if (tag.tagId === (ExifOffsetTagId as number)) {
          ifdOffsetsToRead.push(tag.value as number);
        }
      }
    }

    return result;
  }
}
