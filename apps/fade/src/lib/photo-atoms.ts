import type { ExifDataView, ExifTagEntry } from "./exif";
import type { FileItem } from "./fs";
import { Effect } from "effect";
import { make } from "effect/reactivity/Atom";
import { cachedAtom, emptyAtom, nullableAtom } from "./atoms";
import { scanDirectory } from "./fs";
import { gpuDeviceAtom } from "./gpu-graph";
import { computeHistogram } from "./histogram";
import { createImageDataView } from "./img";
import {
  histogramComputePipelineAtom,
  histogramNormalizePipelineAtom,
  thumbnailPipelineAtom,
} from "./pipelines";
import { DimensionsTagId, RafDataView } from "./raf";
import { createRawImageDataView } from "./raw";
import { renderThumbnail } from "./thumbnail";

/** File handle -> File. */
export const fileAtom = (item: FileItem | null) =>
  nullableAtom(item, "file", async () =>
    item ? await item.handle.getFile() : null,
  );

/** File -> viewable blob; Fujifilm RAF exposes its embedded JPEG. Depends on fileAtom. */
export const previewAtom = (item: FileItem | null) =>
  cachedAtom(
    item,
    "preview",
    () =>
      make((get) =>
        Effect.gen(function* () {
          const file = yield* get.result(fileAtom(item));
          if (!file) return null;

          if (item?.mimeType === "image/x-fujifilm-raf") {
            const buffer = yield* Effect.tryPromise(() => file.arrayBuffer());
            const view = new RafDataView(buffer);
            const jpgView = view.getJpegImage();
            if (!jpgView) return null;
            return new Blob([jpgView as unknown as BlobPart], {
              type: "image/jpeg",
            });
          }

          return file;
        }),
      ),
    emptyAtom as never,
  );

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
    const dimEntry = tags.find(
      (tag) => tag.tagId === (DimensionsTagId as number),
    );

    let width = 0;
    let height = 0;

    if (dimEntry && Array.isArray(dimEntry.value)) {
      // Dimensions value is [height, width]
      [height, width] = dimEntry.value as [number, number];
    }

    return { width, height, data };
  });

/** Blob -> rendered WebP thumbnail. Depends on preview, device and pipeline. */
export const thumbnailAtom = (
  item: FileItem | null,
  width: number,
  height: number,
  quality: number,
) =>
  cachedAtom(
    item,
    `thumbnail:${String(width)}x${String(height)}:${String(quality)}`,
    () =>
      make((get) =>
        Effect.gen(function* () {
          const blob = yield* get.result(previewAtom(item));
          const device = yield* get.result(gpuDeviceAtom);
          const pipeline = yield* get.result(thumbnailPipelineAtom);
          if (
            !device ||
            !pipeline ||
            !blob ||
            (!blob.type.startsWith("image/") &&
              item?.mimeType !== "image/x-fujifilm-raf")
          ) {
            return null;
          }
          return yield* Effect.tryPromise(() =>
            renderThumbnail({
              device,
              pipeline,
              blob,
              fileItem: item,
              width,
              height,
              quality,
            }),
          );
        }),
      ),
    emptyAtom as never,
  );

/** Image -> 256-bin channel histograms. Depends on the GPU graph. */
export const histogramAtom = (image: HTMLImageElement | null) =>
  cachedAtom(
    image,
    "histogram",
    () =>
      make((get) =>
        Effect.gen(function* () {
          const device = yield* get.result(gpuDeviceAtom);
          const computePipeline = yield* get.result(histogramComputePipelineAtom);
          const normalizePipeline = yield* get.result(
            histogramNormalizePipelineAtom,
          );
          if (!image || !device || !computePipeline || !normalizePipeline) {
            return null;
          }
          const imageKey = {
            src: image.currentSrc || image.src,
            width: image.naturalWidth,
            height: image.naturalHeight,
          };
          return yield* Effect.tryPromise(() =>
            computeHistogram({
              device,
              computePipeline,
              normalizePipeline,
              imageKey,
            }),
          );
        }),
      ),
    emptyAtom as never,
  );

/** Directory handle -> the gallery listing. */
export const galleryAtom = (handle: FileSystemDirectoryHandle | null) =>
  nullableAtom(handle, "gallery", async () =>
    handle ? scanDirectory(handle) : [],
  );
