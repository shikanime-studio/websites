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

export interface ExifTagEntry<T = unknown> {
  value: T;
  type: ExifType;
}

export interface ExifTags {
  make?: ExifTagEntry<string>;
  model?: ExifTagEntry<string>;
  dateTimeOriginal?: ExifTagEntry<string>;
  fNumber?: ExifTagEntry<number>;
  exposureTime?: ExifTagEntry<number>;
  iso?: ExifTagEntry<number>;
  focalLength?: ExifTagEntry<number>;
  lensModel?: ExifTagEntry<string>;
  [key: string]: ExifTagEntry | undefined;
}

const TAGS: Record<number, string> = {
  [ExifTagId.Make]: "make",
  [ExifTagId.Model]: "model",
  [ExifTagId.ExifOffset]: "exifOffset",
  [ExifTagId.ExposureTime]: "exposureTime",
  [ExifTagId.FNumber]: "fNumber",
  [ExifTagId.ISO]: "iso",
  [ExifTagId.DateTimeOriginal]: "dateTimeOriginal",
  [ExifTagId.FocalLength]: "focalLength",
  [ExifTagId.LensModel]: "lensModel",
};

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

export class ExifDataView<T = ExifTagId> implements DataView {
  constructor(private view: DataView) {}

  get buffer() {
    return this.view.buffer;
  }

  get byteLength() {
    return this.view.byteLength;
  }

  get byteOffset() {
    return this.view.byteOffset;
  }

  readonly [Symbol.toStringTag] = "ExifDataView";

  getUint8(offset: number) {
    return this.view.getUint8(offset);
  }

  getUint16(offset: number, littleEndian?: boolean) {
    return this.view.getUint16(offset, littleEndian);
  }

  getUint32(offset: number, littleEndian?: boolean) {
    return this.view.getUint32(offset, littleEndian);
  }

  getInt8(offset: number) {
    return this.view.getInt8(offset);
  }

  getInt16(offset: number, littleEndian?: boolean) {
    return this.view.getInt16(offset, littleEndian);
  }

  getInt32(offset: number, littleEndian?: boolean) {
    return this.view.getInt32(offset, littleEndian);
  }

  getFloat32(offset: number, littleEndian?: boolean) {
    return this.view.getFloat32(offset, littleEndian);
  }

  getFloat64(offset: number, littleEndian?: boolean) {
    return this.view.getFloat64(offset, littleEndian);
  }

  getBigInt64(offset: number, littleEndian?: boolean) {
    return this.view.getBigInt64(offset, littleEndian);
  }

  getBigUint64(offset: number, littleEndian?: boolean) {
    return this.view.getBigUint64(offset, littleEndian);
  }

  setUint8(offset: number, value: number) {
    this.view.setUint8(offset, value);
  }

  setUint16(offset: number, value: number, littleEndian?: boolean) {
    this.view.setUint16(offset, value, littleEndian);
  }

  setUint32(offset: number, value: number, littleEndian?: boolean) {
    this.view.setUint32(offset, value, littleEndian);
  }

  setInt8(offset: number, value: number) {
    this.view.setInt8(offset, value);
  }

  setInt16(offset: number, value: number, littleEndian?: boolean) {
    this.view.setInt16(offset, value, littleEndian);
  }

  setInt32(offset: number, value: number, littleEndian?: boolean) {
    this.view.setInt32(offset, value, littleEndian);
  }

  setFloat32(offset: number, value: number, littleEndian?: boolean) {
    this.view.setFloat32(offset, value, littleEndian);
  }

  setFloat64(offset: number, value: number, littleEndian?: boolean) {
    this.view.setFloat64(offset, value, littleEndian);
  }

  setBigInt64(offset: number, value: bigint, littleEndian?: boolean) {
    this.view.setBigInt64(offset, value, littleEndian);
  }

  setBigUint64(offset: number, value: bigint, littleEndian?: boolean) {
    this.view.setBigUint64(offset, value, littleEndian);
  }

  getAscii(offset: number, length: number): string {
    let str = "";
    for (let i = 0; i < length; i++) {
      const charCode = this.view.getUint8(offset + i);
      if (charCode === 0) break;
      str += String.fromCharCode(charCode);
    }
    return str.trim();
  }

  getRational(offset: number, littleEndian?: boolean): number {
    const numerator = this.view.getUint32(offset, littleEndian);
    const denominator = this.view.getUint32(offset + 4, littleEndian);
    return numerator / denominator;
  }

  getSRational(offset: number, littleEndian?: boolean): number {
    const sNumerator = this.view.getInt32(offset, littleEndian);
    const sDenominator = this.view.getInt32(offset + 4, littleEndian);
    return sNumerator / sDenominator;
  }

  getIfd(offset: number, littleEndian?: boolean): number {
    return this.view.getUint16(offset, littleEndian);
  }

  getIfdOffset(offset: number, littleEndian?: boolean): number {
    return this.view.getUint32(offset + 4, littleEndian);
  }

  isLittleEndian(offset: number) {
    return this.view.getUint16(offset, true) === 0x4949;
  }

  getTagHeader(offset: number, littleEndian?: boolean) {
    return {
      tagId: this.view.getUint16(offset, littleEndian) as unknown as T,
      type: this.view.getUint16(offset + 2, littleEndian) as ExifType,
      count: this.view.getUint32(offset + 4, littleEndian),
    };
  }

  getValue(
    offset: number,
    type: ExifType,
    littleEndian?: boolean,
  ) {
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
        return this.view.buffer.slice(
          this.view.byteOffset + offset,
          this.view.byteOffset + offset + count,
        );
      default:
        return null;
    }
  }

  getTag(offset: number, tiffStart: number, littleEndian?: boolean) {
    const { tagId, type, count } = this.getTagHeader(offset, littleEndian);
    const typeSize = getTypeSize(type);
    const totalSize = typeSize * count;

    let valueOffset = offset + 8;
    if (totalSize > 4) {
      valueOffset = this.getUint32(offset + 8, littleEndian) + tiffStart;
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
}

export async function getExifTags(source: FileItem): Promise<ExifTags> {
  const file = await source.handle.getFile();
  switch (source.mimeType) {
    case "image/jpeg":
      return parseJpeg(new ExifDataView(new DataView(await file.arrayBuffer())));
    case "image/png":
      return parsePng(new ExifDataView(new DataView(await file.arrayBuffer())));
    case "image/webp":
      return parseWebP(new ExifDataView(new DataView(await file.arrayBuffer())));
    case "image/tiff":
      return parseExifData(
        new ExifDataView(new DataView(await file.arrayBuffer())),
        0,
      );
    default:
      return {};
  }
}

function parseJpeg(view: ExifDataView): ExifTags {
  let offset = 2;
  const length = view.byteLength;

  while (offset < length) {
    if (offset + 1 >= length) break;
    const marker = view.getUint16(offset);
    offset += 2;

    if (marker === 0xffe1) {
      if (offset + 1 >= length) break;
      const segmentLength = view.getUint16(offset);
      if (
        view.getUint32(offset + 2) === 0x45786966 &&
        view.getUint16(offset + 6) === 0x0000
      ) {
        return parseExifData(view, offset + 8);
      }
      offset += segmentLength;
    } else {
      if ((marker & 0xff00) !== 0xff00) break;
      if (offset + 1 >= length) break;
      const segmentLength = view.getUint16(offset);
      offset += segmentLength;
    }
  }

  return {};
}

function parsePng(view: ExifDataView): ExifTags {
  let offset = 8;
  const length = view.byteLength;

  while (offset < length) {
    if (offset + 8 > length) break;
    const chunkLength = view.getUint32(offset);

    // Check for 'eXIf' chunk (0x65584966)
    if (view.getUint32(offset + 4) === 0x65584966) {
      return parseExifData(view, offset + 8);
    }

    offset += 12 + chunkLength;
  }

  return {};
}

function parseWebP(view: ExifDataView): ExifTags {
  let offset = 12; // Skip RIFF header (12 bytes)
  const length = view.byteLength;

  while (offset < length) {
    if (offset + 8 > length) break;
    const chunkId = view.getUint32(offset);
    const chunkLength = view.getUint32(offset + 4, true); // WebP chunks are little-endian size

    // Check for 'EXIF' chunk (0x45584946)
    if (chunkId === 0x45584946) {
      return parseExifData(view, offset + 8);
    }

    offset += 8 + chunkLength;

    // Add padding byte if chunk size is odd
    if (chunkLength % 2 !== 0) {
      offset += 1;
    }
  }

  return {};
}

function parseExifData(view: ExifDataView, start: number): ExifTags {
  const result: ExifTags = {};

  // Check byte order
  const littleEndian = view.isLittleEndian(start);

  // First IFD offset
  const firstIfdOffset = view.getIfdOffset(start, littleEndian);
  if (firstIfdOffset < 8) return result;

  function readTag(tagOffset: number) {
    const tag = view.getTag(tagOffset, start, littleEndian);

    if (tag.tagId === ExifTagId.ExifOffset) {
      readIfd(start + (tag.value as number));
    } else if (tag.tagId in TAGS) {
      const tagName = TAGS[tag.tagId];
      result[tagName] = {
        value: tag.value,
        type: tag.type,
      };
    }
  }

  function readIfd(offset: number) {
    const entryCount = view.getIfd(offset, littleEndian);
    for (let i = 0; i < entryCount; i++) {
      readTag(offset + 2 + i * 12);
    }
  }

  // Read IFD0
  readIfd(start + firstIfdOffset);

  return result;
}

