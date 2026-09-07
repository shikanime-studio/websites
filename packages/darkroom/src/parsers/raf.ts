/**
 * Fujifilm RAF (Raw Archive File) parser.
 *
 * RAF file structure (big-endian):
 *   Offset 0-47: Version string ("Fujifilm X-Trans" or similar)
 *   Offset 48-51: "FOOL" or "FORM" magic (or TIFF header magic)
 *
 * Actually, the RAF format starts with a 48-byte header:
 *   0-47: Version info (ASCII text, null-padded)
 *
 * The TIFF header starts at offset 48 (little-endian or big-endian).
 * The TIFF IFD0 contains standard tags including ExifOffset.
 * The Exif IFD contains make/model and raw dimensions.
 * The raw CFA data location is found via the RAF-specific offsets:
 *   RawImageOffset (0x0111 StripOffsets in IFD1)
 *   RawImageLength (0x0116 StripByteCounts)
 */

import { ExifTagId, ExifType } from "../parsers/exif";

export interface RafRawFrame {
  width: number;
  height: number;
  bitDepth: number;
  cfa: Uint16Array;
  make: string;
  model: string;
}

/** Standard RGGB Bayer pattern for Fujifilm cameras */
export const RAF_CFA_PATTERN = "rggb";

/**
 * JPEG SOI/EOI markers.
 */
const SOI = 0xffd8;
const EOI = 0xffd9;

/**
 * Extract an embedded JPEG from inside a RAF file.
 *
 * RAF files typically store a JPEG thumbnail near the beginning.
 * Uses JPEG SOI (0xFFD8) + EOI (0xFFD9) marker scanning from offset 0.
 */
export function extractJpegFromRaf(data: ArrayBuffer): Uint8ClampedArray | null {
  const view = new DataView(data);
  let soiOffset = -1;

  for (let i = 0; i + 1 < view.byteLength; i++) {
    if (view.getUint16(i, false) === SOI) {
      soiOffset = i;
      break;
    }
  }

  if (soiOffset === -1) return null;

  for (let i = soiOffset + 2; i + 1 < view.byteLength; i++) {
    if (view.getUint16(i, false) === EOI) {
      return new Uint8ClampedArray(view.buffer.slice(soiOffset, i + 2));
    }
  }

  return null;
}

const TIFF_HEADER_OFFSET = 48; // TIFF header starts after RAF version block

function isRAF(data: DataView): boolean {
  if (data.byteLength < 148) return false; // Need at least up to IFD

  // Check for RAF magic at offset 48: "FOOL" (0x464f4f4c) or "FORM" (0x464f524d)
  const magic = data.getUint32(TIFF_HEADER_OFFSET, false);
  if (magic === 0x464f4f4c || magic === 0x464f524d) {
    return true;
  }

  // Also check by TIFF header byte order marks at offset 48
  const bom = data.getUint16(TIFF_HEADER_OFFSET, true);
  if (bom === 0x4949 || bom === 0x4d4d) {
    // Verify it has a valid TIFF magic (42 or 0x4352)
    const tiffMagic = data.getUint16(TIFF_HEADER_OFFSET + 2, bom === 0x4949);
    if (tiffMagic === 42 || tiffMagic === 0x4352) {
      return true;
    }
  }

  return false;
}

function getTiffInfo(data: DataView): { littleEndian: boolean; firstIfdOffset: number } | null {
  const bom = data.getUint16(TIFF_HEADER_OFFSET, true);
  const littleEndian = bom === 0x4949;
  const tiffMagic = data.getUint16(TIFF_HEADER_OFFSET + 2, littleEndian);

  if (tiffMagic !== 42 && tiffMagic !== 0x4352) return null;

  const firstIfdOffset = data.getUint32(TIFF_HEADER_OFFSET + 4, littleEndian);
  if (firstIfdOffset < 8 || TIFF_HEADER_OFFSET + firstIfdOffset + 2 > data.byteLength) return null;

  return { littleEndian, firstIfdOffset };
}

function readTagValue(data: DataView, tagOffset: number, littleEndian: boolean): {
  tagId: number;
  type: number;
  count: number;
  valueOffset: number;
} {
  return {
    tagId: data.getUint16(tagOffset, littleEndian),
    type: data.getUint16(tagOffset + 2, littleEndian),
    count: data.getUint32(tagOffset + 4, littleEndian),
    valueOffset: data.getUint32(tagOffset + 8, littleEndian),
  };
}

function getExifValue(
  data: DataView,
  tagOffset: number,
  littleEndian: boolean,
  type: number,
  count: number,
  valueOffset: number,
): number | string | null {
  const tiffBase = TIFF_HEADER_OFFSET;
  switch (type) {
    case ExifType.SHORT:
      return count === 1
        ? data.getUint16(tagOffset + 8, littleEndian)
        : null;
    case ExifType.LONG:
      return count === 1
        ? data.getUint16(tagOffset + 8, littleEndian)
        : data.getUint32(tagOffset + 8, littleEndian);
    case ExifType.ASCII: {
      const absOffset = tiffBase + valueOffset;
      let str = "";
      for (let i = 0; i < count && absOffset + i < data.byteLength; i++) {
        const ch = data.getUint8(absOffset + i);
        if (ch === 0) break;
        str += String.fromCharCode(ch);
      }
      return str;
    }
    default:
      return null;
  }
}

export function parseRaf(data: ArrayBuffer): RafRawFrame | null {
  const view = new DataView(data);

  if (!isRAF(view)) {
    return null;
  }

  const tiffInfo = getTiffInfo(view);
  if (!tiffInfo) return null;

  const { littleEndian, firstIfdOffset } = tiffInfo;
  const tiffBase = TIFF_HEADER_OFFSET;
  const ifd0Offset = tiffBase + firstIfdOffset;

  // Parse IFD0 for dimensions
  let width = 0;
  let height = 0;
  let bitDepth = 14; // RAF default
  let exifIfdOffset = 0;
  let rawImageOffset = 0;
  let rawImageLength = 0;

  const entryCount = view.getUint16(ifd0Offset, littleEndian);

  for (let i = 0; i < entryCount; i++) {
    const tagOffset = ifd0Offset + 2 + i * 12;
    if (tagOffset + 12 > view.byteLength) break;

    const { tagId, type, count, valueOffset } = readTagValue(view, tagOffset, littleEndian);

    switch (tagId) {
      case 0x0100: // ImageWidth
        width = count === 1 && type === ExifType.LONG
          ? view.getUint32(tagOffset + 8, littleEndian)
          : view.getUint16(tagOffset + 8, littleEndian);
        break;
      case 0x0101: // ImageLength
        height = count === 1 && type === ExifType.LONG
          ? view.getUint32(tagOffset + 8, littleEndian)
          : view.getUint16(tagOffset + 8, littleEndian);
        break;
      case 0x0102: // BitsPerSample
        bitDepth = type === ExifType.SHORT
          ? view.getUint16(tagOffset + 8, littleEndian)
          : 14;
        break;
      case ExifTagId.ExifOffset: // Exif IFD pointer (0x8769)
        exifIfdOffset = valueOffset;
        break;
      case 0x0111: // StripOffsets
        rawImageOffset = count === 1 && type === ExifType.LONG
          ? view.getUint32(tagOffset + 8, littleEndian)
          : valueOffset;
        break;
      case 0x0116: // StripByteCounts
        rawImageLength = count === 1 && type === ExifType.LONG
          ? view.getUint32(tagOffset + 8, littleEndian)
          : valueOffset;
        break;
    }
  }

  // Parse Exif IFD for make/model
  let make = "Fujifilm";
  let model = "Unknown";

  if (exifIfdOffset > 0 && tiffBase + exifIfdOffset + 2 <= view.byteLength) {
    const exifIfdOffsetAbs = tiffBase + exifIfdOffset;
    const exifEntryCount = view.getUint16(exifIfdOffsetAbs, littleEndian);

    for (let i = 0; i < exifEntryCount; i++) {
      const tagOffset = exifIfdOffsetAbs + 2 + i * 12;
      if (tagOffset + 12 > view.byteLength) break;

      const { tagId, type, count, valueOffset } = readTagValue(view, tagOffset, littleEndian);

      switch (tagId) {
        case ExifTagId.Make: {
          const val = getExifValue(view, tagOffset, littleEndian, type, count, valueOffset);
          if (typeof val === "string" && val.length > 0) make = val;
          break;
        }
        case ExifTagId.Model: {
          const val = getExifValue(view, tagOffset, littleEndian, type, count, valueOffset);
          if (typeof val === "string" && val.length > 0) model = val;
          break;
        }
      }
    }
  }

  // If we didn't find raw data in IFD0, check IFD1 (thumbnail/next IFD)
  if (rawImageOffset === 0 || rawImageLength === 0) {
    const nextIfdOffset = view.getUint32(ifd0Offset + 2 + entryCount * 12, littleEndian);
    if (nextIfdOffset > 0 && tiffBase + nextIfdOffset + 2 <= view.byteLength) {
      const ifd1Offset = tiffBase + nextIfdOffset;
      const ifd1Count = view.getUint16(ifd1Offset, littleEndian);

      for (let i = 0; i < ifd1Count; i++) {
        const tagOffset = ifd1Offset + 2 + i * 12;
        if (tagOffset + 12 > view.byteLength) break;

        const tagId = view.getUint16(tagOffset, littleEndian);
        const type = view.getUint16(tagOffset + 2, littleEndian);
        const count = view.getUint32(tagOffset + 4, littleEndian);
        const valueOffset = view.getUint32(tagOffset + 8, littleEndian);

        if (tagId === 0x0111) {
          rawImageOffset = count === 1 && type === ExifType.LONG
            ? view.getUint32(tagOffset + 8, littleEndian)
            : valueOffset;
        } else if (tagId === 0x0116) {
          rawImageLength = count === 1 && type === ExifType.LONG
            ? view.getUint32(tagOffset + 8, littleEndian)
            : valueOffset;
        }
      }
    }
  }

  if (width === 0 || height === 0) return null;

  // Read CFA data
  let cfa: Uint16Array = new Uint16Array(0);

  if (rawImageOffset > 0 && rawImageLength > 0) {
    const rawOffset = tiffBase + rawImageOffset;
    const availableBytes = view.byteLength - rawOffset;
    const neededBytes = width * height * 2; // 16-bit per pixel

    if (availableBytes >= neededBytes) {
      cfa = new Uint16Array(width * height);
      for (let i = 0; i < width * height; i++) {
        cfa[i] = view.getUint16(rawOffset + i * 2, littleEndian);
      }
    }
  }

  return { width, height, bitDepth, cfa, make, model };
}
