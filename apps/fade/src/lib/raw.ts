import { JpgDataView } from "./img";
import type { ImageDataView } from "./img";
import type { ExifDataView } from "./exif";
import type { FileItem } from "./fs";

export const RafOffset = {
  JpegImageOffset: 84,
  JpegImageLength: 88,
  CfaHeaderOffset: 92,
  CfaHeaderLength: 96,
  CfaOffset: 100,
  CfaLength: 104,
} as const;

export interface RafMetadata {
  width: number;
  height: number;
}

export class RafDataView<T extends ArrayBufferLike>
  extends DataView<T>
  implements ImageDataView
{
  getEmbeddedImage(): JpgDataView<T> | null {
    if (this.byteLength < RafOffset.JpegImageLength) return null;

    // Offset to JPEG Image Offset is at 84 (Big Endian)
    const jpegOffset = this.getUint32(RafOffset.JpegImageOffset, false);
    // Length of JPEG Image is at 88 (Big Endian)
    const jpegLength = this.getUint32(RafOffset.JpegImageLength, false);

    if (
      jpegOffset > 0 &&
      jpegLength > 0 &&
      jpegOffset + jpegLength <= this.byteLength
    ) {
      return new JpgDataView(
        this.buffer,
        this.byteOffset + jpegOffset,
        jpegLength,
      );
    }

    return null;
  }

  getMetadata(): RafMetadata | null {
    const headerOffset = this.getUint32(RafOffset.CfaHeaderOffset, false);
    // const headerLength = this.getUint32(RafOffset.CfaHeaderLength, false);

    if (headerOffset <= 0 || headerOffset >= this.byteLength) return null;

    const count = this.getUint32(headerOffset, false);
    let offset = headerOffset + 4;
    let width = 0;
    let height = 0;

    for (let i = 0; i < count; i++) {
      const tagId = this.getUint16(offset, false);
      const size = this.getUint16(offset + 2, false);
      const dataOffset = offset + 4;

      // 0x100: Sensor Dimensions? Or 0x121: Output Height Width?
      // Based on docs: 0x111: Active area Height Width
      // Let's look for dimensions.
      if (tagId === 0x0111) {
        height = this.getUint16(dataOffset, false);
        width = this.getUint16(dataOffset + 2, false);
      } else if (tagId === 0x0121) {
          // Output dimensions often better?
          // height = this.getUint16(dataOffset, false);
          // width = this.getUint16(dataOffset + 2, false);
      }

      offset += 4 + size;
    }

    // If we didn't find 0x111, try 0x121 or others if needed.
    // For now, let's assume we might find it.

    if (width > 0 && height > 0) {
      return { width, height };
    }
    return null;
  }

  getRawData(): { width: number; height: number; data: Uint16Array } | null {
      const metadata = this.getMetadata();
      if (!metadata) return null;

      const cfaOffset = this.getUint32(RafOffset.CfaOffset, false);
      const cfaLength = this.getUint32(RafOffset.CfaLength, false);

      if (cfaOffset <= 0 || cfaLength <= 0 || cfaOffset + cfaLength > this.byteLength) {
          return null;
      }

      // Assuming 16-bit data (2 bytes per pixel)
      // Check if size matches width * height * 2
      // Some RAFs might be packed or compressed.
      // If uncompressed, size should be roughly width * height * 2 (or more for alignment)

      // Let's just return the buffer for now.
      // We need to handle endianness for the raw values?
      // Raw data usually matches the file endianness (Big Endian).
      // But creating a Uint16Array on a Little Endian system (like most) will swap bytes if we just cast the buffer.
      // We should read it carefully or use DataView if performance allows, or swap bytes if needed.

      // For now, let's try to interpret it.

      const rawData = new Uint8Array(this.buffer, this.byteOffset + cfaOffset, cfaLength);
      // We need to convert this to Uint16 values.
      const pixelCount = metadata.width * metadata.height;
      const pixels = new Uint16Array(pixelCount);

      // Basic decoding (Big Endian 16-bit)
      // This is slow in JS, but fine for a demo.
      // Note: X-Trans sensors might have complex layout.
      for (let i = 0; i < pixelCount; i++) {
          if (i * 2 + 1 < rawData.length) {
              pixels[i] = (rawData[i * 2] << 8) | rawData[i * 2 + 1];
          }
      }

      return {
          width: metadata.width,
          height: metadata.height,
          data: pixels
      };
  }

  getExif(offset: number): ExifDataView<T> | null {
    const jpg = this.getEmbeddedImage();
    return jpg ? jpg.getExif(offset) : null;
  }
}

export async function createRawImageDataView(
  source: FileItem,
): Promise<RafDataView<ArrayBuffer> | null> {
  const file = await source.handle.getFile();
  switch (source.mimeType) {
    case "image/x-fujifilm-raf":
      return new RafDataView(await file.arrayBuffer());
    default:
      return null;
  }
}
