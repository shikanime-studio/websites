import { ExifDataView } from "./exif";
import { createRawImageDataView } from "./raw";
import type { RafDataView } from "./raf";
import type { FileItem } from "./fs";

const JpegMarker = {
  SOI: 0xffd8,
  APP1: 0xffe1,
  ExifHeader: 0x45786966, // 'Exif'
  Zero: 0x0000,
  Prefix: 0xff00,
} as const;

const PngMarker = {
  Signature1: 0x89504e47, // \x89PNG
  Signature2: 0x0d0a1a0a, // \r\n\x1a\n
  ExifChunk: 0x65584966, // eXIf
} as const;

const WebPMarker = {
  Riff: 0x52494646, // RIFF
  WebP: 0x57454250, // WEBP
  Exif: 0x45584946, // EXIF
} as const;

export interface ImageDataView extends DataView {
  getExif: () => ExifDataView<ArrayBufferLike> | null;
}

export class JpegDataView<T extends ArrayBufferLike>
  extends DataView<T>
  implements ImageDataView
{
  getExif(): ExifDataView<T> | null {
    let offset = 0;

    // Skip SOI marker if present at offset
    if (this.byteLength > 1 && this.getUint16(offset) === JpegMarker.SOI) {
      offset += 2;
    }

    while (offset < this.byteLength) {
      if (offset + 1 >= this.byteLength) break;
      const marker = this.getUint16(offset);
      offset += 2;

      if (marker === JpegMarker.APP1) {
        if (offset + 1 >= this.byteLength) break;
        const segmentLength = this.getUint16(offset);
        if (
          this.getUint32(offset + 2) === JpegMarker.ExifHeader &&
          this.getUint16(offset + 6) === JpegMarker.Zero
        ) {
          return new ExifDataView(
            this.buffer,
            this.byteOffset + offset + 8,
            segmentLength - 8,
          );
        }
        offset += segmentLength;
      } else {
        if ((marker & JpegMarker.Prefix) !== JpegMarker.Prefix) break;
        if (offset + 1 >= this.byteLength) break;
        const segmentLength = this.getUint16(offset);
        offset += segmentLength;
      }
    }

    return null;
  }
}

export class PngDataView<T extends ArrayBufferLike>
  extends DataView<T>
  implements ImageDataView
{
  getExif(): ExifDataView<T> | null {
    let offset = 0;

    // Skip PNG signature if present at offset
    if (
      this.byteLength > 7 &&
      this.getUint32(offset) === PngMarker.Signature1 &&
      this.getUint32(offset + 4) === PngMarker.Signature2
    ) {
      offset += 8;
    }

    while (offset < this.byteLength) {
      if (offset + 8 > this.byteLength) break;
      const chunkLength = this.getUint32(offset);

      // Check for 'eXIf' chunk
      if (this.getUint32(offset + 4) === PngMarker.ExifChunk) {
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

export class WebPDataView<T extends ArrayBufferLike>
  extends DataView<T>
  implements ImageDataView
{
  getExif(): ExifDataView<T> | null {
    let offset = 0;

    // Skip RIFF header if present at offset
    if (
      this.byteLength > 11 &&
      this.getUint32(offset) === WebPMarker.Riff && // RIFF
      this.getUint32(offset + 8) === WebPMarker.WebP // WEBP
    ) {
      offset += 12;
    }

    while (offset < this.byteLength) {
      if (offset + 8 > this.byteLength) break;
      const chunkId = this.getUint32(offset);
      const chunkLength = this.getUint32(offset + 4, true); // WebP chunks are little-endian size

      // Check for 'EXIF' chunk
      if (chunkId === WebPMarker.Exif) {
        return new ExifDataView(
          this.buffer,
          this.byteOffset + offset + 8,
          chunkLength,
        );
      }

      offset += 8 + chunkLength;

      // Add padding byte if chunk size is odd
      if (chunkLength % 2 !== 0) {
        offset += 1;
      }
    }

    return null;
  }
}

export class TiffDataView<T extends ArrayBufferLike>
  extends ExifDataView<T>
  implements ImageDataView
{
  getExif(): ExifDataView<T> | null {
    return this;
  }
}

export async function createImageDataView(
  source: FileItem,
): Promise<ImageDataView | RafDataView<ArrayBuffer> | null> {
  const file = await source.handle.getFile();
  switch (source.mimeType) {
    case "image/jpeg":
      return new JpegDataView(await file.arrayBuffer());
    case "image/png":
      return new PngDataView(await file.arrayBuffer());
    case "image/webp":
      return new WebPDataView(await file.arrayBuffer());
    case "image/tiff":
      return new TiffDataView(await file.arrayBuffer());
    case "image/x-fujifilm-raf":
      return createRawImageDataView(source);
    default:
      return null;
  }
}
