import type { ExifDataView, ExifTagEntry } from "./exif";
import type { FileItem } from "./fs";
import { nullableAtom } from "./atoms";
import { scanDirectory } from "./fs";
import { createImageDataView } from "./img";
import { DimensionsTagId, RafDataView } from "./raf";
import { createRawImageDataView } from "./raw";

/** File handle -> File. */
export const fileAtom = (item: FileItem | null) =>
  nullableAtom(item, "file", async () =>
    item ? await item.handle.getFile() : null,
  );

/** File -> viewable blob; Fujifilm RAF exposes its embedded JPEG. */
export const previewAtom = (item: FileItem | null, file: File | null) =>
  nullableAtom(file, "preview", async () => {
    if (!file) return null;

    if (item?.mimeType === "image/x-fujifilm-raf") {
      const buffer = await file.arrayBuffer();
      const view = new RafDataView(buffer);
      const jpgView = view.getJpegImage();
      if (!jpgView) return null;
      return new Blob([jpgView as unknown as BlobPart], { type: "image/jpeg" });
    }

    return file;
  });

/** Camera metadata for the info panel. */
export const exifAtom = (item: FileItem | null) =>
  nullableAtom<ExifTagEntry[]>(item, "exif", async () => {
    if (!item) return null;

    try {
      const view = await createImageDataView(item);
      if (!view) return null;

      let exifView: ExifDataView<ArrayBufferLike> | null = null;
      if (view instanceof RafDataView) {
        const jpeg = view.getJpegImage();
        if (jpeg) {
          exifView = jpeg.getExif();
        }
      } else {
        exifView = view.getExif();
      }

      return exifView ? exifView.getTagEntries() : null;
    } catch (error) {
      console.error(
        "Failed to read the camera data (EXIF) for this image.",
        error,
      );
      return null;
    }
  });

/** Demosaiced sensor data plus its dimensions. */
export const rawImageAtom = (item: FileItem | null) =>
  nullableAtom(item, "raw-image", async () => {
    if (!item) return null;

    const view = await createRawImageDataView(item);
    if (!view) return null;

    const data = view.getCfa();
    if (!data) return null;
    const header = view.getCfaHeader();
    if (!header) return null;
    const tags = header.getTagEntries();
    const dimEntry = tags.find((tag) => tag.tagId === (DimensionsTagId as number));

    let width = 0;
    let height = 0;

    if (dimEntry && Array.isArray(dimEntry.value)) {
      // Dimensions value is [height, width]
      [height, width] = dimEntry.value as [number, number];
    }

    return { width, height, data };
  });

/** Directory handle -> the gallery listing. */
export const galleryAtom = (handle: FileSystemDirectoryHandle | null) =>
  nullableAtom(handle, "gallery", async () =>
    handle ? scanDirectory(handle) : [],
  );
