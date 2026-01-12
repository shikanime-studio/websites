import { ExifDataView } from "./exif";
import { createRawImageDataView } from "./raw";
import type { FileItem } from "./fs";

export interface ImageDataView extends DataView {
  getExif: (offset: number) => ExifDataView<ArrayBufferLike> | null;
}

export class JpgDataView<T extends ArrayBufferLike>
  extends DataView<T>
  implements ImageDataView
{
  getExif(offset: number): ExifDataView<T> | null {
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
          return new ExifDataView(
            this.buffer,
            this.byteOffset + offset + 8,
            segmentLength - 8,
          );
        }
        offset += segmentLength;
      } else {
        if ((marker & 0xff00) !== 0xff00) break;
        if (offset + 1 >= length) break;
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
  getExif(offset: number): ExifDataView<T> | null {
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
  getExif(offset: number): ExifDataView<T> | null {
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
): Promise<ImageDataView | null> {
  const file = await source.handle.getFile();
  switch (source.mimeType) {
    case "image/jpeg":
      return new JpgDataView(await file.arrayBuffer());
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
