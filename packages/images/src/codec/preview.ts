import type { ImageSource } from "./source";
import { RafDataView } from "./raf";

/**
 * The bytes the viewer can actually draw: a RAW sidecar resolves to its
 * embedded JPEG, everything else is already viewable.
 */
export async function readPreview(
  source: ImageSource,
): Promise<{ bytes: ArrayBuffer; type: string } | null> {
  const file = await source.getFile();
  if (source.mimeType === "image/x-fujifilm-raf") {
    const buffer = await file.arrayBuffer();
    const view = new RafDataView(buffer);
    const jpeg = view.getJpegImage();
    if (!jpeg) return null;
    // Copy out of the RAF buffer so the caller can transfer the bytes.
    return {
      bytes: jpeg.buffer.slice(
        jpeg.byteOffset,
        jpeg.byteOffset + jpeg.byteLength,
      ) as ArrayBuffer,
      type: "image/jpeg",
    };
  }
  return { bytes: await file.arrayBuffer(), type: file.type };
}
