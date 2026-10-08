/**
 * React integration — the Effect atoms API surface for the viewer.
 *
 * Pipelines are composable named functions returning Effects over the
 * image service context; `ImageRuntime` lifts them into typed atoms and
 * `Atom.family` memoizes one atom per file. Components read the
 * `AsyncResult` state with `useAtomSuspense` under the app's
 * `RegistryProvider`.
 */

import * as Atom from "effect/unstable/reactivity/Atom";
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult";
import { Effect, Layer } from "effect";
import { useAtomSuspense } from "@effect/atom-react";
import { FileSystemLive, readFile } from "@shikanime-studio/fs";
import type { FileItem } from "@shikanime-studio/fs";
import { ImageWorkerLive, getExif, parseRaw } from "./worker-client";
import { extractJpegFromRaf } from "./parsers/raf";
import type { ExifTagEntry } from "./parsers/exif";

/** Every service the image pipelines depend on, built once per registry. */
const ImageServices = Layer.mergeAll(FileSystemLive, ImageWorkerLive);

/** The atom runtime carrying the image service context. */
export const ImageRuntime = Atom.runtime(ImageServices);

const RAF_MIME = "image/x-fujifilm-raf";
const UNKNOWN_MIME = "application/octet-stream";

const mimeTypeOf = (fileItem: FileItem): string =>
  fileItem.mimeType ?? UNKNOWN_MIME;

/** Named pipeline: file item -> loaded File. */
const readFilePipeline = (fileItem: FileItem) =>
  Effect.map(readFile(fileItem), (data) => new File([data.data], data.name));

/** Named pipeline: File -> RAF embedded JPEG decoded to an image File. */
const decodeRafPreview = (file: File): Effect.Effect<File | null> =>
  Effect.flatMap(
    Effect.promise(() => file.arrayBuffer()),
    (buffer) =>
      Effect.sync(() => {
        const jpegBytes = extractJpegFromRaf(buffer);
        if (!jpegBytes) return null;
        return new File([jpegBytes], file.name, { type: "image/jpeg" });
      }),
  );

/** Named pipeline: file item -> preview File (RAF decoded, else passthrough). */
const previewPipeline = (fileItem: FileItem) =>
  Effect.flatMap(readFilePipeline(fileItem), (file) =>
    mimeTypeOf(fileItem) === RAF_MIME
      ? decodeRafPreview(file)
      : Effect.succeed<File | null>(file),
  );

/** Named pipeline: file item -> EXIF tags via the worker. */
const exifPipeline = (fileItem: FileItem) =>
  Effect.flatMap(readFile(fileItem), (data) =>
    getExif(data.data, mimeTypeOf(fileItem)));

/** Named pipeline: file item -> raw viewer frame + metadata. */
const rawImagePipeline = (fileItem: FileItem) =>
  Effect.flatMap(readFile(fileItem), (data) =>
    Effect.map(
      parseRaw(data.data, mimeTypeOf(fileItem)),
      (frame) => ({
        width: frame.width,
        height: frame.height,
        bitDepth: frame.bitDepth,
        cfa: frame.cfa,
        make: frame.make,
        name: data.name,
      }),
    ));

/** Per-file memoized atoms: one registry entry per FileItem. */
const fileAtom = Atom.family((fileItem: FileItem | null) =>
  ImageRuntime.atom(() =>
    fileItem ? readFilePipeline(fileItem) : Effect.succeed<File | null>(null),
  ));

const previewAtom = Atom.family((fileItem: FileItem | null) =>
  ImageRuntime.atom(() =>
    fileItem ? previewPipeline(fileItem) : Effect.succeed<File | null>(null),
  ));

const exifAtom = Atom.family((fileItem: FileItem | null) =>
  ImageRuntime.atom(() =>
    fileItem ? exifPipeline(fileItem) : Effect.succeed<Array<ExifTagEntry>>([]),
  ));

const rawImageAtom = Atom.family((fileItem: FileItem | null) =>
  ImageRuntime.atom(() =>
    fileItem ? rawImagePipeline(fileItem) : Effect.succeed(null),
  ));

const useAtomValueOrNull = <A, E>(
  atom: Atom.Atom<AsyncResult.AsyncResult<A, E>>,
): A | null => {
  const result = useAtomSuspense(atom, { includeFailure: true });
  return AsyncResult.isSuccess(result) ? result.value : null;
};

/** Loaded file for the selected item, suspended. */
export function useFile(fileItem: FileItem | null) {
  return {
    file: useAtomValueOrNull(fileAtom(fileItem)),
    mimeType: fileItem?.mimeType,
  };
}

/** Preview blob (RAF embedded JPEG when applicable), suspended. */
export function usePreview(fileItem: FileItem | null) {
  return {
    blob: useAtomValueOrNull(previewAtom(fileItem)),
    mimeType: fileItem?.mimeType,
  };
}

/** EXIF tag entries for the item, suspended; empty when absent. */
export function useExif(fileItem: FileItem | null) {
  return useAtomValueOrNull(exifAtom(fileItem));
}

/** Raw viewer frame contract for the item, suspended. */
export function useRawImage(fileItem: FileItem | null) {
  return useAtomValueOrNull(rawImageAtom(fileItem));
}
