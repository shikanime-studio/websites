import type { ExifTagEntry } from "./exif";
import type { ImageSource } from "./source";
import { createImageDataView } from "./img";
import { RafDataView } from "./raf";

/** Every EXIF tag the container advertises, or nothing when it has none. */
export async function readExif(
  source: ImageSource,
): Promise<Array<ExifTagEntry> | null> {
  const view = await createImageDataView(source);
  if (!view) return null;
  // A RAW sidecar keeps its EXIF inside the embedded JPEG.
  if (view instanceof RafDataView) {
    return view.getJpegImage()?.getExif()?.getTagEntries() ?? null;
  }
  return view.getExif()?.getTagEntries() ?? null;
}
