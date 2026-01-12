import { JpgDataView } from "./img";
import type { ImageDataView } from "./img";
import type { ExifDataView } from "./exif";
import type { FileItem } from "./fs";

export const RafOffset = {
  JpegImageOffset: 84,
  JpegImageLength: 88,
} as const;

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
