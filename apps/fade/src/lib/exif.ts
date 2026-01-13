export enum Endianness {
  Little = 0x4949, // 'II'
  Big = 0x4d4d, // 'MM'
}

export enum ExifType {
  BYTE = 1,
  ASCII = 2,
  SHORT = 3,
  LONG = 4,
  RATIONAL = 5,
  SLONG = 9,
  SRATIONAL = 10,
}

export enum ExifTagId {
  Make = 0x010f,
  Model = 0x0110,
  ExifOffset = 0x8769,
  ExposureTime = 0x829a,
  FNumber = 0x829d,
  ISO = 0x8827,
  DateTimeOriginal = 0x9003,
  FocalLength = 0x920a,
  LensModel = 0xa433,
}

export type ExifTagEntry =
  | { tagId: ExifTagId.Make; value: string }
  | { tagId: ExifTagId.Model; value: string }
  | { tagId: ExifTagId.ExifOffset; value: number }
  | { tagId: ExifTagId.ExposureTime; value: number }
  | { tagId: ExifTagId.FNumber; value: number }
  | { tagId: ExifTagId.ISO; value: number }
  | { tagId: ExifTagId.DateTimeOriginal; value: string }
  | { tagId: ExifTagId.FocalLength; value: number }
  | { tagId: ExifTagId.LensModel; value: string }
  | { tagId: number; value: unknown };

export function sizeOf(type: ExifType): number {
  switch (type) {
    case ExifType.BYTE:
    case ExifType.ASCII:
      return 1;
    case ExifType.SHORT:
      return 2;
    case ExifType.LONG:
    case ExifType.SLONG:
      return 4;
    case ExifType.RATIONAL:
    case ExifType.SRATIONAL:
      return 8;
    default:
      return 0;
  }
}

export function isContainer(type: ExifType) {
  return type === ExifType.ASCII || type === ExifType.BYTE;
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
    return this.getUint16(0, true) === Endianness.Little.valueOf();
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
      case ExifType.SHORT:
        return this.getUint16(offset, littleEndian);
      case ExifType.LONG:
        return this.getUint32(offset, littleEndian);
      case ExifType.RATIONAL:
        return this.getRational(offset, littleEndian);
      case ExifType.SRATIONAL:
        return this.getSRational(offset, littleEndian);
      default:
        return null;
    }
  }

  getContainer(offset: number, type: ExifType, count: number) {
    switch (type) {
      case ExifType.ASCII:
        return this.getAscii(offset, count);
      case ExifType.BYTE:
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

        if (tag.tagId === (ExifTagId.ExifOffset as number)) {
          ifdOffsetsToRead.push(tag.value as number);
        }
      }
    }

    return result;
  }
}
