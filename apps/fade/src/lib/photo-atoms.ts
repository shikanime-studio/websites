import type { ExifDataView, ExifTagEntry } from "./exif";
import type { FileItem } from "./fs";
import { Effect } from "effect";
import { family, make } from "effect/reactivity/Atom";
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

/**
 * Derived resources, one atom per key.
 *
 * `Atom.family` is Effect's own cache: an atom is created once per key and
 * dropped once nothing references it (WeakRef + FinalizationRegistry), so a
 * re-render reuses the running query instead of restarting it, and a closed
 * directory can be collected. A load that fails resolves to `null`: a broken
 * preview hides one thumbnail, it does not fail the editor.
 */

const settledNull = Effect.succeed(null);

/** File handle -> File. */
export const fileAtom = family((item: FileItem | null) =>
  make(
    item
      ? Effect.tryPromise(() => item.handle.getFile()).pipe(
        Effect.orElseSucceed(() => null),
      )
      : settledNull,
  ),
);

/** File -> viewable blob; Fujifilm RAF exposes its embedded JPEG. Depends on fileAtom. */
export const previewAtom = family((item: FileItem | null) =>
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
    }).pipe(Effect.orElseSucceed(() => null)),
  ),
);

/** Camera metadata for the info panel. */
export const exifAtom = family((item: FileItem | null) =>
  make(
    item
      ? Effect.gen(function* () {
        const view = yield* Effect.tryPromise(() => createImageDataView(item));
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
      }).pipe(
        Effect.orElseSucceed(() => null),
        Effect.map((entries) => entries as ExifTagEntry[] | null),
      )
      : settledNull,
  ),
);

/** Demosaiced sensor data plus its dimensions. */
export const rawImageAtom = family((item: FileItem | null) =>
  make(
    item
      ? Effect.gen(function* () {
        const view = yield* Effect.tryPromise(() =>
          createRawImageDataView(item),
        );
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
          [height, width] = dimEntry.value as [number, number];
        }

        return { width, height, data };
      }).pipe(Effect.orElseSucceed(() => null))
      : settledNull,
  ),
);

/**
 * Blob -> rendered WebP thumbnail. The outer family caches per file, the inner
 * one per requested size and quality, so two filmstrip sizes do not fight over
 * a single entry.
 */
const thumbnailAtoms = family((item: FileItem | null) =>
  family((spec: string) => {
    const [width, height, quality] = spec.split(":").map(Number) as [
      number,
      number,
      number,
    ];
    return make((get) =>
      Effect.gen(function* () {
        const blob = yield* get.result(previewAtom(item));
        const device = yield* get.result(gpuDeviceAtom);
        const pipeline = yield* get.result(thumbnailPipelineAtom);
        if (
          !device
          || !pipeline
          || !blob
          || (!blob.type.startsWith("image/")
            && item?.mimeType !== "image/x-fujifilm-raf")
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
      }).pipe(Effect.orElseSucceed(() => null)),
    );
  }),
);

export const thumbnailAtom = (
  item: FileItem | null,
  width: number,
  height: number,
  quality: number,
) => thumbnailAtoms(item)(`${String(width)}:${String(height)}:${String(quality)}`);

/** Image -> 256-bin channel histograms. Depends on the GPU graph. */
export const histogramAtom = family((image: HTMLImageElement | null) =>
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
    }).pipe(Effect.orElseSucceed(() => null)),
  ),
);

/** Directory handle -> the gallery listing. */
export const galleryAtom = family((handle: FileSystemDirectoryHandle | null) =>
  make(
    handle
      ? Effect.tryPromise(() => scanDirectory(handle)).pipe(
        Effect.orElseSucceed(() => []),
      )
      : Effect.succeed([] as Array<FileItem>),
  ),
);
