import type { FileItem } from "./fs";

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

export function getTypeSize(type: ExifType): number {
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
  readonly [Symbol.toStringTag] = "ExifDataView";

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

  getIfd(offset: number, littleEndian?: boolean): number {
    return this.getUint16(offset, littleEndian);
  }

  getIfdOffset(offset: number, littleEndian?: boolean): number {
    return this.getUint32(offset + 4, littleEndian);
  }

  isLittleEndian(offset: number) {
    return this.getUint16(offset, true) === 0x4949;
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

  getTagEntry(offset: number, headerOffset: number, littleEndian?: boolean) {
    const { tagId, type, count } = this.getTagHeader(offset, littleEndian);
    const typeSize = getTypeSize(type);
    const totalSize = typeSize * count;

    let valueOffset = offset + 8;
    if (totalSize > 4) {
      valueOffset = this.getUint32(offset + 8, littleEndian) + headerOffset;
    }

    const value = isContainer(type)
      ? this.getContainer(valueOffset, type, count)
      : this.getValue(valueOffset, type, littleEndian);

    return {
      tagId,
      type,
      value,
    };
  }

  getTagEntries(offset: number): Array<ExifTagEntry> {
    const result: Array<ExifTagEntry> = [];

    // Check byte order
    const littleEndian = this.isLittleEndian(offset);

    // First IFD offset
    const firstIfdOffset = this.getIfdOffset(offset, littleEndian);
    if (firstIfdOffset < 8) return result;

    const readTag = (tagOffset: number) => {
      const tag = this.getTagEntry(tagOffset, offset, littleEndian);
      result.push(tag);
      if (tag.tagId === (ExifTagId.ExifOffset as number)) {
        readIfd(offset + (tag.value as number));
      }
    };

    const readIfd = (tagOffset: number) => {
      const entryCount = this.getIfd(tagOffset, littleEndian);
      for (let i = 0; i < entryCount; i++) {
        readTag(tagOffset + 2 + i * 12);
      }
    };

    // Read IFD0
    readIfd(offset + firstIfdOffset);

    return result;
  }
}

class JpgDataView<T extends ArrayBufferLike> extends ExifDataView<T> {
  getTagEntries(offset: number): Array<ExifTagEntry> {
    const length = this.byteLength;

    // Skip SOI marker if present at offset
    if (offset + 1 < length && this.getUint16(offset) === 0xffd8) {
      offset += 2;
    }

    while (offset < length) {
      if (offset + 1 >= length) break;
      const marker = this.getUint16(offset);
      offset += 2;

      if (marker === 0xffe1) {
        if (offset + 1 >= length) break;
        const segmentLength = this.getUint16(offset);
        if (
          this.getUint32(offset + 2) === 0x45786966 &&
          this.getUint16(offset + 6) === 0x0000
        ) {
          return super.getTagEntries(offset + 8);
        }
        offset += segmentLength;
      } else {
        if ((marker & 0xff00) !== 0xff00) break;
        if (offset + 1 >= length) break;
        const segmentLength = this.getUint16(offset);
        offset += segmentLength;
      }
    }

    return [];
  }
}

class PngDataView<T extends ArrayBufferLike> extends ExifDataView<T> {
  getTagEntries(offset: number): Array<ExifTagEntry> {
    const length = this.byteLength;

    // Skip PNG signature if present at offset
    if (
      offset + 7 < length &&
      this.getUint32(offset) === 0x89504e47 &&
      this.getUint32(offset + 4) === 0x0d0a1a0a
    ) {
      offset += 8;
    }

    while (offset < length) {
      if (offset + 8 > length) break;
      const chunkLength = this.getUint32(offset);

      // Check for 'eXIf' chunk (0x65584966)
      if (this.getUint32(offset + 4) === 0x65584966) {
        return super.getTagEntries(offset + 8);
      }

      offset += 12 + chunkLength;
    }

    return [];
  }
}

class WebPDataView<T extends ArrayBufferLike> extends ExifDataView<T> {
  getTagEntries(offset: number): Array<ExifTagEntry> {
    const length = this.byteLength;

    // Skip RIFF header if present at offset
    if (
      offset + 11 < length &&
      this.getUint32(offset) === 0x52494646 && // RIFF
      this.getUint32(offset + 8) === 0x57454250 // WEBP
    ) {
      offset += 12;
    }

    while (offset < length) {
      if (offset + 8 > length) break;
      const chunkId = this.getUint32(offset);
      const chunkLength = this.getUint32(offset + 4, true); // WebP chunks are little-endian size

      // Check for 'EXIF' chunk (0x45584946)
      if (chunkId === 0x45584946) {
        return super.getTagEntries(offset + 8);
      }

      offset += 8 + chunkLength;

      // Add padding byte if chunk size is odd
      if (chunkLength % 2 !== 0) {
        offset += 1;
      }
    }

    return [];
  }
}

export async function getTagEntries(
  source: FileItem,
  offset = 0,
): Promise<Array<ExifTagEntry> | null> {
  const file = await source.handle.getFile();
  switch (source.mimeType) {
    case "image/jpeg":
      return new JpgDataView(await file.arrayBuffer()).getTagEntries(offset);
    case "image/png":
      return new PngDataView(await file.arrayBuffer()).getTagEntries(offset);
    case "image/webp":
      return new WebPDataView(await file.arrayBuffer()).getTagEntries(offset);
    case "image/tiff":
      return new ExifDataView(await file.arrayBuffer()).getTagEntries(offset);
    default:
      return null;
  }
}
