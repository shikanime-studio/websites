/**
 * Filesystem abstraction — Effect service over the File System Access
 * API (browser-local backend). Other backends satisfy the same
 * service via their own Layer.
 *
 * Architecture: vfs → dataviewer → xxxdataviewer → metadata cache → canvas engine
 * Single buffer, zero-copy data flow.
 */

import { Context, Data, Effect, Layer, Stream } from "effect";

/** A file item that can be opened and read */
export interface FileItem {
  name: string;
  mimeType?: string | undefined;
  size?: number | undefined;
  lastModified?: number | undefined;
  /** Sidecar files associated with this file (e.g., .xmp alongside .raf) */
  sidecars: Array<FileItem>;
  /** The underlying storage handle — used by the provider */
  handle: FileSystemFileHandle;
}

/** Result of a file read operation */
export interface FileData {
  /** The file content as ArrayBuffer */
  data: ArrayBuffer;
  /** MIME type detected from file content */
  mimeType?: string | undefined;
  /** The original file name */
  name: string;
}

export class FsError extends Data.TaggedError("FsError")<{
  message: string;
}> {}

/** Storage backend contract, provided via Layer. */
export class FileSystem extends Context.Tag("FileSystem")<FileSystem, {
  readonly readFile: (fileItem: FileItem) => Effect.Effect<FileData, FsError>;
  readonly readFileStream: (
    fileItem: FileItem,
  ) => Stream.Stream<Uint8Array, FsError>;
}>() {}

const toFsError = (cause: unknown) =>
  new FsError({ message: cause instanceof Error ? cause.message : String(cause) });

export const FileSystemLive = Layer.succeed(FileSystem, {
  readFile: (fileItem) =>
    Effect.tryPromise({
      try: async () => {
        const file = await fileItem.handle.getFile();
        return {
          data: await file.arrayBuffer(),
          mimeType: fileItem.mimeType,
          name: fileItem.name,
        };
      },
      catch: toFsError,
    }),
  readFileStream: (fileItem) =>
    Stream.fromAsyncIterable(
      (async function* () {
        const reader = (await fileItem.handle.getFile()).stream().getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) yield value;
          }
        } finally {
          reader.releaseLock();
        }
      })(),
      toFsError,
    ),
});

/** Read a file via the FileSystem service (defaults to the local backend). */
export const readFile = (fileItem: FileItem) =>
  Effect.flatMap(FileSystem, (fs) => fs.readFile(fileItem)).pipe(
    Effect.provide(FileSystemLive),
  );

/** Read a file as a chunk stream (defaults to the local backend). */
export const readFileStream = (fileItem: FileItem) =>
  Stream.unwrap(Effect.map(FileSystem, (fs) => fs.readFileStream(fileItem))).pipe(
    Stream.provideLayer(FileSystemLive),
  );

/**
 * Scan a directory handle for file items, grouping sidecars by
 * basename under the highest-scoring primary (image/video > other).
 */
export const scanDirectory = (
  directoryHandle: FileSystemDirectoryHandle,
): Effect.Effect<Array<FileItem>, FsError> =>
  Effect.tryPromise({
    try: async () => {
      const handles: Array<FileSystemFileHandle> = [];
      for await (const handle of directoryHandle.values()) {
        if (handle.kind === "file") {
          handles.push(handle as FileSystemFileHandle);
        }
      }
      return await Promise.all(
        handles.map(async (handle) => {
          const file = await handle.getFile();
          return {
            name: handle.name,
            mimeType: undefined,
            size: file.size,
            lastModified: file.lastModified,
            handle,
            sidecars: [],
          } satisfies FileItem;
        }),
      );
    },
    catch: toFsError,
  }).pipe(
    Effect.map((items) => {
      const groups = new Map<string, Array<FileItem>>();
      for (const item of items) {
        const lastDotIndex = item.name.lastIndexOf(".");
        const basename =
          lastDotIndex === -1 ? item.name : item.name.substring(0, lastDotIndex);
        const group = groups.get(basename) ?? [];
        group.push(item);
        groups.set(basename, group);
      }

      const result: Array<FileItem> = [];
      for (const groupItems of groups.values()) {
        let primaryItem: FileItem | undefined;
        let bestScore = -1;
        for (const item of groupItems) {
          // Score: image/video > other
          const score =
            item.mimeType?.startsWith("image/") ||
            item.mimeType?.startsWith("video/")
              ? 2
              : 1;
          if (score > bestScore) {
            bestScore = score;
            primaryItem = item;
          }
        }

        if (!primaryItem) continue;
        const sidecars = groupItems.filter((i) => i !== primaryItem);
        sidecars.sort((a, b) => a.name.localeCompare(b.name));
        primaryItem.sidecars = sidecars;
        result.push(primaryItem);
      }

      result.sort((a, b) => a.name.localeCompare(b.name));
      return result;
    }),
  );
