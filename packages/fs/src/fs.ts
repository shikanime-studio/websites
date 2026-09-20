/**
 * Filesystem access as an Effect service over the File System Access API.
 *
 * The service is a Context key; backends are Layers. Consumers compose
 * named pipeline functions and receive dependencies through the R channel.
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
export class FileSystem extends Context.Service<FileSystem, {
  readonly readFile: (fileItem: FileItem) => Effect.Effect<FileData, FsError>;
  readonly readFileStream: (
    fileItem: FileItem,
  ) => Stream.Stream<Uint8Array, FsError>;
}>()("FileSystem") {}

const toFsError = (cause: unknown) =>
  new FsError({ message: cause instanceof Error ? cause.message : String(cause) });

function isFileHandle(
  handle: FileSystemHandle,
): handle is FileSystemFileHandle {
  return handle.kind === "file";
}

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

/** Read a file through the FileSystem service in context. */
export const readFile = (
  fileItem: FileItem,
): Effect.Effect<FileData, FsError, FileSystem> =>
  Effect.flatMap(FileSystem, (fs) => fs.readFile(fileItem));

/** Read a file as a chunk stream through the FileSystem service in context. */
export const readFileStream = (
  fileItem: FileItem,
): Stream.Stream<Uint8Array, FsError, FileSystem> =>
  Stream.unwrap(Effect.map(FileSystem, (fs) => fs.readFileStream(fileItem)));

const basenameOf = (name: string): string => {
  const lastDot = name.lastIndexOf(".");
  return lastDot === -1 ? name : name.substring(0, lastDot);
};

type PrimaryScore = 1 | 2;
const scoreOf = (item: FileItem): PrimaryScore =>
  item.mimeType?.startsWith("image/") || item.mimeType?.startsWith("video/")
    ? 2
    : 1;

/** Group items by basename, keeping the highest-scoring primary per group. */
export const groupByPrimary = (items: Array<FileItem>): Array<FileItem> => {
  const groups = new Map<string, Array<FileItem>>();
  for (const item of items) {
    const basename = basenameOf(item.name);
    const group = groups.get(basename) ?? [];
    group.push(item);
    groups.set(basename, group);
  }

  const result: Array<FileItem> = [];
  for (const groupItems of groups.values()) {
    const primaryItem = groupItems.reduce<FileItem | undefined>(
      (best, item) =>
        best === undefined || scoreOf(item) > scoreOf(best) ? item : best,
      undefined,
    );
    if (!primaryItem) continue;
    primaryItem.sidecars = groupItems
      .filter((item) => item !== primaryItem)
      .sort((a, b) => a.name.localeCompare(b.name));
    result.push(primaryItem);
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
};

/** List the file handles of a directory. */
export const listFileHandles = (
  directoryHandle: FileSystemDirectoryHandle,
): Effect.Effect<Array<FileSystemFileHandle>, FsError> =>
  Effect.tryPromise({
    try: async () => {
      const handles: Array<FileSystemFileHandle> = [];
      for await (const handle of directoryHandle.values()) {
        if (isFileHandle(handle)) {
          handles.push(handle);
        }
      }
      return handles;
    },
    catch: toFsError,
  });

const toFileItem = (
  handle: FileSystemFileHandle,
): Effect.Effect<FileItem, FsError> =>
  Effect.map(
    Effect.tryPromise({
      try: () => handle.getFile(),
      catch: toFsError,
    }),
    (file) => ({
      name: handle.name,
      mimeType: undefined,
      size: file.size,
      lastModified: file.lastModified,
      handle,
      sidecars: [],
    }),
  );

/**
 * Scan a directory handle for file items, grouping sidecars by
 * basename under the highest-scoring primary (image/video > other).
 */
export const scanFileItems = (
  directoryHandle: FileSystemDirectoryHandle,
): Effect.Effect<Array<FileItem>, FsError, FileSystem> =>
  Effect.flatMap(listFileHandles(directoryHandle), (handles) =>
    Effect.map(
      Effect.forEach(handles, (handle) => toFileItem(handle), {
        concurrency: "unbounded",
      }),
      groupByPrimary,
    ));
