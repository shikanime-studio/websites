/**
 * Lightweight image metadata parser.
 *
 * Detects image format (JPEG, PNG, WebP, TIFF) and extracts dimensions,
 * bit depth, and color space from the file header without decoding pixels.
 */

export enum ImageFormat {
  Jpeg = "jpeg",
  Png = "png",
  Webp = "webp",
  Tiff = "tiff",
  Unknown = "unknown",
}

export interface ImageDimensions {
  format: ImageFormat;
  width: number;
  height: number;
  bitDepth: number;
}

function isJpeg(data: DataView): boolean {
  return data.byteLength >= 2 && data.getUint16(0) === 0xffd8;
}

function isPng(data: DataView): boolean {
  return (
    data.byteLength >= 8 &&
    data.getUint32(0) === 0x89504e47 && // \x89PNG
    data.getUint32(4) === 0x0d0a1a0a // \r\n\x1a\n
  );
}

function isWebp(data: DataView): boolean {
  return (
    data.byteLength >= 12 &&
    data.getUint32(0) === 0x52494646 && // RIFF
    data.getUint32(8) === 0x57454250 // WEBP
  );
}

function isTiff(data: DataView): boolean {
  return (
    data.byteLength >= 4 &&
    (data.getUint16(0) === 0x4949 || data.getUint16(0) === 0x4d4d)
  );
}

export function detectFormat(data: DataView): ImageFormat {
  if (isJpeg(data)) return ImageFormat.Jpeg;
  if (isPng(data)) return ImageFormat.Png;
  if (isWebp(data)) return ImageFormat.Webp;
  if (isTiff(data)) return ImageFormat.Tiff;
  return ImageFormat.Unknown;
}

// ── JPEG ─────────────────────────────────────────

function parseJpeg(data: DataView): ImageDimensions | null {
  let offset = 0;
  if (data.byteLength < 2 || data.getUint16(offset) !== 0xffd8) return null;
  offset += 2;

  while (offset < data.byteLength - 1) {
    if (data.getUint16(offset) !== 0xff) return null;
    const marker = data.getUint8(offset + 1);
    offset += 2;

    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue; // standalone markers, no length
    }
    if (marker === 0xd9) break; // EOI

    const segmentLength = data.getUint16(offset);
    offset += segmentLength;

    // SOF0, SOF1, SOF2, SOF3, SOF5, SOF6, SOF7, SOF9, SOF10, SOF11
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      // SOF frame
      const bitDepth = data.getUint8(offset + 2);
      const height = data.getUint16(offset + 3);
      const width = data.getUint16(offset + 5);
      return { format: ImageFormat.Jpeg, width, height, bitDepth };
    }
  }

  return { format: ImageFormat.Jpeg, width: 0, height: 0, bitDepth: 8 };
}

// ── PNG ──────────────────────────────────────────

function parsePng(data: DataView): ImageDimensions | null {
  let offset = 8; // skip signature

  while (offset + 8 <= data.byteLength) {
    const chunkLength = data.getUint32(offset);
    const chunkType = data.getUint32(offset + 4);
    offset += 8;

    if (chunkType === 0x49484452) {
      // IHDR
      const width = data.getUint32(offset);
      const height = data.getUint32(offset + 4);
      const bitDepth = data.getUint8(offset + 8);
      return { format: ImageFormat.Png, width, height, bitDepth };
    }

    offset += chunkLength + 4; // data + CRC
  }

  return null;
}

// ── WebP ─────────────────────────────────────────

function parseWebp(data: DataView): ImageDimensions | null {
  let offset = 12; // skip RIFF + WEBP

  while (offset + 8 <= data.byteLength) {
    const chunkFourcc = data.getUint32(offset);
    const chunkLength = data.getUint32(offset + 4, true);
    offset += 8;

    if (chunkFourcc === 0x56503820) {
      // VP8
      // width and height are stored as 16-bit values with a bit mask
      const width = data.getUint16(offset + 6) & 0x3fff;
      const height = data.getUint16(offset + 8) & 0x3fff;
      return { format: ImageFormat.Webp, width, height, bitDepth: 8 };
    }

    if (chunkFourcc === 0x5650384c) {
      // VP8L
      const width = (data.getUint32(offset + 1) & 0xffffff) + 1;
      const height = ((data.getUint32(offset + 1) >> 3) & 0xffffff) + 1;
      return { format: ImageFormat.Webp, width, height, bitDepth: 8 };
    }

    if (chunkFourcc === 0x56503920) {
      // VP9
      const width = data.getUint16(offset + 2);
      const height = data.getUint16(offset + 4);
      return { format: ImageFormat.Webp, width, height, bitDepth: 8 };
    }

    offset += chunkLength;
    if (chunkLength % 2 !== 0) offset += 1;
  }

  return null;
}

// ── TIFF (including RAF and raw formats with TIFF structure) ─────

function parseTiff(data: DataView): ImageDimensions | null {
  const littleEndian = data.getUint16(0) === 0x4949;

  // Check magic version
  const magic = data.getUint16(4, littleEndian);
  if (magic !== 42 && magic !== 0x4352) {
    // Not standard TIFF (42) or Samsung (0x4352 = 'CR')
    // Could still be a raw format with TIFF header
  }

  const firstIfdOffset = data.getUint32(4, littleEndian);
  if (firstIfdOffset < 8 || firstIfdOffset + 2 > data.byteLength) return null;

  const entryCount = data.getUint16(firstIfdOffset, littleEndian);
  let foundWidth = false;
  let foundHeight = false;
  let width = 0;
  let height = 0;
  let bitDepth = 16; // raw files default to 16-bit

  for (let i = 0; i < entryCount; i++) {
    const tagOffset = firstIfdOffset + 2 + i * 12;
    if (tagOffset + 12 > data.byteLength) break;

    const tagId = data.getUint16(tagOffset, littleEndian);
    const type = data.getUint16(tagOffset + 2, littleEndian);
    const valueOffset = data.getUint32(tagOffset + 8, littleEndian) + 8; // RAF offsets are relative to TIFF header +8

    if (tagId === 0x0100) {
      // ImageWidth
      if (type === 3) {
        width = data.getUint16(tagOffset + 8, littleEndian);
        foundWidth = true;
      } else if (type === 4) {
        width = valueOffset;
        foundWidth = true;
      }
    } else if (tagId === 0x0101) {
      // ImageLength (Height)
      if (type === 3) {
        height = data.getUint16(tagOffset + 8, littleEndian);
        foundHeight = true;
      } else if (type === 4) {
        height = valueOffset;
        foundHeight = true;
      }
    } else if (tagId === 0x0102) {
      // BitsPerSample
      if (type === 3) {
        bitDepth = data.getUint16(tagOffset + 8, littleEndian);
      }
    }
  }

  if (foundWidth && foundHeight) {
    return { format: ImageFormat.Tiff, width, height, bitDepth };
  }

  return { format: ImageFormat.Tiff, width: 0, height: 0, bitDepth: 16 };
}

export function getImageDimensions(data: ArrayBuffer): ImageDimensions | null {
  const view = new DataView(data);
  const format = detectFormat(view);

  switch (format) {
    case ImageFormat.Jpeg:
      return parseJpeg(view);
    case ImageFormat.Png:
      return parsePng(view);
    case ImageFormat.Webp:
      return parseWebp(view);
    case ImageFormat.Tiff:
      return parseTiff(view);
    default:
      return null;
  }
}
