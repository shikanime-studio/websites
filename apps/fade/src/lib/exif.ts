export interface ExifTags {
  make?: string;
  model?: string;
  dateTimeOriginal?: string;
  fNumber?: number;
  exposureTime?: number;
  iso?: number;
  focalLength?: number;
  lensModel?: string;
}

const TAGS = {
  0x010f: "make",
  0x0110: "model",
  0x8769: "exifOffset",
  0x829a: "exposureTime",
  0x829d: "fNumber",
  0x8827: "iso",
  0x9003: "dateTimeOriginal",
  0x920a: "focalLength",
  0xa433: "lensModel",
} as const;

type TagId = keyof typeof TAGS;

export async function getExifTags(file: File): Promise<ExifTags> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  switch (file.type) {
    case "image/jpeg":
      return parseJpeg(view);
    case "image/png":
      return parsePng(view);
    case "image/webp":
      return parseWebP(view);
    case "image/tiff":
      return parseExifData(view, 0);
    default:
      return {};
  }
}

function parseJpeg(view: DataView): ExifTags {
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

function parsePng(view: DataView): ExifTags {
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

function parseWebP(view: DataView): ExifTags {
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

function parseExifData(view: DataView, start: number): ExifTags {
  const result: ExifTags = {};

  // Check byte order
  const littleEndian = view.getUint16(start) === 0x4949;

  // First IFD offset
  const firstIfdOffset = view.getUint32(start + 4, littleEndian);
  if (firstIfdOffset < 8) return result;

  const tags: Record<string, unknown> = {};

  function readTag(tagOffset: number) {
    const tagId = view.getUint16(tagOffset, littleEndian) as TagId;
    const type = view.getUint16(tagOffset + 2, littleEndian);
    const count = view.getUint32(tagOffset + 4, littleEndian);

    // Value or offset to value
    let valueOffset = tagOffset + 8;
    const typeSize = getTypeSize(type);
    const totalSize = typeSize * count;

    if (totalSize > 4) {
      valueOffset = view.getUint32(tagOffset + 8, littleEndian) + start;
    }

    if (tagId in TAGS) {
      const tagName = TAGS[tagId];
      if (tagName === "exifOffset") {
        const exifOffset = view.getUint32(tagOffset + 8, littleEndian);
        readIfd(start + exifOffset);
      } else {
        tags[tagName] = readValue(view, valueOffset, type, count, littleEndian);
      }
    }
  }

  function readIfd(offset: number) {
    const entryCount = view.getUint16(offset, littleEndian);
    for (let i = 0; i < entryCount; i++) {
      readTag(offset + 2 + i * 12);
    }
  }

  // Read IFD0
  readIfd(start + firstIfdOffset);

  // Map extracted tags to result interface
  if (tags.make) result.make = tags.make as string;
  if (tags.model) result.model = tags.model as string;
  if (tags.dateTimeOriginal)
    result.dateTimeOriginal = tags.dateTimeOriginal as string;
  if (tags.fNumber) result.fNumber = tags.fNumber as number;
  if (tags.exposureTime) result.exposureTime = tags.exposureTime as number;
  if (tags.iso) result.iso = tags.iso as number;
  if (tags.focalLength) result.focalLength = tags.focalLength as number;
  if (tags.lensModel) result.lensModel = tags.lensModel as string;

  return result;
}

function getTypeSize(type: number): number {
  switch (type) {
    case 1:
      return 1; // BYTE
    case 2:
      return 1; // ASCII
    case 3:
      return 2; // SHORT
    case 4:
      return 4; // LONG
    case 5:
      return 8; // RATIONAL
    case 9:
      return 4; // SLONG
    case 10:
      return 8; // SRATIONAL
    default:
      return 0;
  }
}

function readValue(
  view: DataView,
  offset: number,
  type: number,
  count: number,
  littleEndian: boolean,
): unknown {
  switch (type) {
    case 2: {
      // ASCII
      let str = "";
      for (let i = 0; i < count; i++) {
        const charCode = view.getUint8(offset + i);
        if (charCode === 0) break;
        str += String.fromCharCode(charCode);
      }
      return str.trim();
    }
    case 3: // SHORT
      return view.getUint16(offset, littleEndian);
    case 4: // LONG
      return view.getUint32(offset, littleEndian);
    case 5: {
      // RATIONAL
      const numerator = view.getUint32(offset, littleEndian);
      const denominator = view.getUint32(offset + 4, littleEndian);
      return numerator / denominator;
    }
    case 10: {
      // SRATIONAL
      const sNumerator = view.getInt32(offset, littleEndian);
      const sDenominator = view.getInt32(offset + 4, littleEndian);
      return sNumerator / sDenominator;
    }
    default:
      return null;
  }
}
