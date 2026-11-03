import type { ImageSource } from "./source";
import { RafDataView } from "./raf";

export async function createRawImageDataView(
  source: ImageSource,
): Promise<RafDataView<ArrayBuffer> | null> {
  const file = await source.getFile();
  switch (source.mimeType) {
    case "image/x-fujifilm-raf":
      return new RafDataView(await file.arrayBuffer());
    default:
      return null;
  }
}
