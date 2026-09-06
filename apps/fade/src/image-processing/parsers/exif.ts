/**
 * EXIF / TIFF IFD parser for browser-side image processing.
 *
 * Ported from the existing app/src/lib/exif.ts with full type safety.
 * Reads EXIF tags from JPEG APP1, PNG eXIf, WebP EXIF, and TIFF containers.
 */

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

export type ExifTagEntry = {
  tagId: number;
  type: ExifType;
  value: unknown;
};

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

function isContainer(type: ExifType): boolean {
  return type === ExifType.ASCII || type === ExifType.BYTE;
}

export class ExifDataView<T extends ArrayBufferLike = ArrayBufferLike> {
  constructor(
    public readonly buffer: T,
    public readonly byteOffset: number = 0,
    public readonly byteLength?: number,
  ) {}

  private get _view(): DataView<T> {
    return new DataView(this.buffer, this.byteOffset, this.byteLength);
  }

  getAscii(offset: number, length: number): string {
    const view = this._view;
    let str = "";
    for (let i = 0; i < length; i++) {
      const charCode = view.getUint8(offset + i);
      if (charCode === 0) break;
      str += String.fromCharCode(charCode);
    }
    return str.trim();
  }

  getRational(offset: number, littleEndian?: boolean): number {
    const view = this._view;
    const numerator = view.getUint32(offset, littleEndian);
    const denominator = view.getUint32(offset + 4, littleEndian);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  getSRational(offset: number, littleEndian?: boolean): number {
    const view = this._view;
    const sNumerator = view.getInt32(offset, littleEndian);
    const sDenominator = view.getInt32(offset + 4, littleEndian);
    return sDenominator === 0 ? 0 : sNumerator / sDenominator;
  }

  isLittleEndian(): boolean {
    return this._view.getUint16(0, true) === Endianness.Little.valueOf();
  }

  getTagHeader(offset: number, littleEndian?: boolean) {
    const view = this._view;
    return {
      tagId: view.getUint16(offset, littleEndian),
      type: view.getUint16(offset + 2, littleEndian) as ExifType,
      count: view.getUint32(offset + 4, littleEndian),
    };
  }

  getValue(offset: number, type: ExifType, littleEndian?: boolean) {
    const view = this._view;
    switch (type) {
      case ExifType.SHORT:
        return view.getUint16(offset, littleEndian);
      case ExifType.LONG:
        return view.getUint32(offset, littleEndian);
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

  getTagEntry(offset: number, littleEndian?: boolean): ExifTagEntry {
    const { tagId, type, count } = this.getTagHeader(offset, littleEndian);
    const typeSize = sizeOf(type);
    const totalSize = typeSize * count;

    let valueOffset = offset + 8;
    if (totalSize > 4) {
      valueOffset = this._view.getUint32(offset + 8, littleEndian);
    }

    const value = isContainer(type)
      ? this.getContainer(valueOffset, type, count)
      : this.getValue(valueOffset, type, littleEndian);

    return { tagId, type, value };
  }

  getTagEntries(): ExifTagEntry[] {
    const result: ExifTagEntry[] = [];

    const littleEndian = this.isLittleEndian();
    const firstIfdOffset = this._view.getUint32(4, littleEndian);
    if (firstIfdOffset < 8) return result;

    const ifdOffsetsToRead: number[] = [firstIfdOffset];

    while (ifdOffsetsToRead.length > 0) {
      const currentIfdOffset = ifdOffsetsToRead.pop();
      if (currentIfdOffset === undefined) break;

      const entryCount = this._view.getUint16(currentIfdOffset, littleEndian);
      for (let i = 0; i < entryCount; i++) {
        const tagOffset = currentIfdOffset + 2 + i * 12;
        if (tagOffset + 12 > this._view.byteLength) break;

        const tag = this.getTagEntry(tagOffset, littleEndian);
        result.push(tag);

        if (tag.tagId === ExifTagId.ExifOffset) {
          if (typeof tag.value === "number") {
            ifdOffsetsToRead.push(tag.value);
          }
        }
      }
    }

    return result;
  }
}

// ── Container parsers ────────────────────────────────────────────

export class JpegDataView<T extends ArrayBufferLike = ArrayBufferLike> {
  constructor(
    public readonly buffer: T,
    public readonly byteOffset: number = 0,
    public readonly byteLength?: number,
  ) {}

  private get _view(): DataView<T> {
    return new DataView(this.buffer, this.byteOffset, this.byteLength);
  }

  getExif(): ExifDataView<T> | null {
    const view = this._view;
    let offset = 0;

    if (view.byteLength > 1 && view.getUint16(offset) === 0xffd8) {
      offset += 2;
    }

    while (offset < view.byteLength) {
      if (offset + 1 >= view.byteLength) break;
      const marker = view.getUint16(offset);
      offset += 2;

      if (marker === 0xffe1) {
        // APP1
        if (offset + 1 >= view.byteLength) break;
        const segmentLength = view.getUint16(offset);
        if (
          view.getUint32(offset + 2) === 0x45786966 && // 'Exif'
          view.getUint16(offset + 6) === 0x0000
        ) {
          return new ExifDataView(
            this.buffer,
            this.byteOffset + offset + 8,
            segmentLength - 8,
          );
        }
        offset += segmentLength;
      } else if (marker === 0xffe0 || marker === 0xffe2 || marker === 0xffe3) {
        // APP0/APP2/APP3 — skip
        if (offset + 1 >= view.byteLength) break;
        const segmentLength = view.getUint16(offset);
        offset += segmentLength;
      } else if (marker === 0xffda) {
        // SOS — start of scan
        break;
      } else {
        if ((marker & 0xff00) !== 0xff00) break;
        if (offset + 1 >= view.byteLength) break;
        const segmentLength = view.getUint16(offset);
        offset += segmentLength;
      }
    }

    return null;
  }
}

export class PngDataView<T extends ArrayBufferLike = ArrayBufferLike> {
  constructor(
    public readonly buffer: T,
    public readonly byteOffset: number = 0,
    public readonly byteLength?: number,
  ) {}

  private get _view(): DataView<T> {
    return new DataView(this.buffer, this.byteOffset, this.byteLength);
  }

  getExif(): ExifDataView<T> | null {
    const view = this._view;
    let offset = 0;

    if (
      view.byteLength > 7 &&
      view.getUint32(offset) === 0x89504e47 && // \x89PNG
      view.getUint32(offset + 4) === 0x0d0a1a0a // \r\n\x1a\n
    ) {
      offset += 8;
    }

    while (offset < view.byteLength) {
      if (offset + 8 > view.byteLength) break;
      const chunkLength = view.getUint32(offset);
      if (view.getUint32(offset + 4) === 0x65584966) {
        // eXIf
        return new ExifDataView(
          this.buffer,
          this.byteOffset + offset + 8,
          chunkLength,
        );
      }
      offset += 12 + chunkLength;
    }

    return null;
  }
}

export class WebPDataView<T extends ArrayBufferLike = ArrayBufferLike> {
  constructor(
    public readonly buffer: T,
    public readonly byteOffset: number = 0,
    public readonly byteLength?: number,
  ) {}

  private get _view(): DataView<T> {
    return new DataView(this.buffer, this.byteOffset, this.byteLength);
  }

  getExif(): ExifDataView<T> | null {
    const view = this._view;
    let offset = 0;

    if (
      view.byteLength > 11 &&
      view.getUint32(offset) === 0x52494646 && // RIFF
      view.getUint32(offset + 8) === 0x57454250 // WEBP
    ) {
      offset += 12;
    }

    while (offset < view.byteLength) {
      if (offset + 8 > view.byteLength) break;
      const chunkId = view.getUint32(offset);
      const chunkLength = view.getUint32(offset + 4, true);

      if (chunkId === 0x45584946) {
        // EXIF
        return new ExifDataView(
          this.buffer,
          this.byteOffset + offset + 8,
          chunkLength,
        );
      }

      offset += 8 + chunkLength;
      if (chunkLength % 2 !== 0) offset += 1;
    }

    return null;
  }
}

export class TiffDataView<
  T extends ArrayBufferLike = ArrayBufferLike,
> extends ExifDataView<T> {
  getExif(): ExifDataView<T> | null {
    return this;
  }
}
