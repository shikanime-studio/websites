/**
 * Filesystem abstraction layer.
 *
 * Provides a uniform interface for file operations that can be backed by
 * different implementations:
 * - Local: File System Access API (browser)
 * - Remote: HTTP/WebDAV endpoints
 * - Cloud: S3, Google Cloud Storage, etc.
 *
 * Currently implements the Local provider. Remote/Cloud providers
 * can be added by implementing the FileSystem interface.
 *
 * Architecture: vfs → dataviewer → xxxdataviewer → metadata cache → canvas engine
 * Single buffer, zero-copy data flow.
 */

/** A file item that can be opened and read */
export interface FileItem {
  name: string;
  mimeType?: string;
  size?: number;
  lastModified?: number;
  /** Sidecar files associated with this file (e.g., .xmp alongside .raf) */
  sidecars: Array<FileItem>;
  /** The underlying storage handle — used by the provider */
  handle: FileSystemFileHandle;
}

/** A directory entry that lists files */
export interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: number;
}

/** Result of a file read operation */
export interface FileData {
  /** The file content as ArrayBuffer */
  data: ArrayBuffer;
  /** MIME type detected from file content */
  mimeType?: string;
  /** The original file name */
  name: string;
}

/**
 * FileSystem interface — the contract for file operations.
 * Implementations provide access to different storage backends.
 */
export interface FileSystem {
  /** Open a directory and return file items */
  scanDirectory(directoryPath?: string): Promise<Array<FileItem>>;

  /** Read a file's contents as ArrayBuffer */
  readFile(fileItem: FileItem): Promise<FileData>;

  /** Read a file's contents as a stream */
  readFileStream(fileItem: FileItem): AsyncIterable<Uint8Array>;

  /** Create a blob URL from file data */
  createObjectURL(fileItem: FileItem): Promise<string>;

  /** Get the display name for this filesystem */
  getDisplayName(): string;

  /** Check if this filesystem is read-only */
  isReadOnly(): boolean;
}

/**
 * Local filesystem provider using the File System Access API.
 */
export class LocalFileSystem implements FileSystem {
  async scanDirectory(_directoryPath?: string): Promise<Array<FileItem>> {
    const dirHandle = await (window as any).showDirectoryPicker();
    return scanDirectoryFromHandle(dirHandle);
  }

  async readFile(fileItem: FileItem): Promise<FileData> {
    const file = await fileItem.handle.getFile();
    const data = await file.arrayBuffer();
    return { data, mimeType: fileItem.mimeType, name: fileItem.name };
  }

  async *readFileStream(fileItem: FileItem): AsyncIterable<Uint8Array> {
    const file = await fileItem.handle.getFile();
    const reader = file.stream().getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield new Uint8Array(value);
      }
    } finally {
      reader.releaseLock();
    }
  }

  async createObjectURL(fileItem: FileItem): Promise<string> {
    const file = await fileItem.handle.getFile();
    return URL.createObjectURL(file);
  }

  getDisplayName(): string {
    return "Local";
  }

  isReadOnly(): boolean {
    return true;
  }
}

/**
 * Scan a directory handle for file items (used by GalleryProvider).
 */
export async function scanDirectoryFromHandle(
  directoryHandle: FileSystemDirectoryHandle,
): Promise<Array<FileItem>> {
  const handles: Array<FileSystemFileHandle> = [];

  for await (const handle of directoryHandle.values()) {
    if (handle.kind === "file") {
      handles.push(handle as FileSystemFileHandle);
    }
  }

  const items = await Promise.all(
    handles.map(async (handle) => {
      const file = await handle.getFile();
      return {
        name: handle.name,
        mimeType: undefined,
        size: file.size,
        lastModified: file.lastModified,
        handle,
        sidecars: [],
      };
    }),
  );

  // Group by basename to populate sidecars
  const groups = new Map<string, Array<FileItem>>();
  for (const item of items) {
    const lastDotIndex = item.name.lastIndexOf(".");
    const basename = lastDotIndex === -1 ? item.name : item.name.substring(0, lastDotIndex);
    let group = groups.get(basename);
    if (!group) {
      group = [];
      groups.set(basename, group);
    }
    group.push(item);
  }

  const result: Array<FileItem> = [];
  for (const groupItems of groups.values()) {
    let primaryItem = groupItems[0];
    let bestScore = -1;
    for (const item of groupItems) {
      let score = 0;
      item.mimeType ??= undefined;
      // Score: image/video > other
      if (item.mimeType?.startsWith("image/") || item.mimeType?.startsWith("video/")) {
        score = 2;
      } else {
        score = 1;
      }
      if (score > bestScore) {
        bestScore = score;
        primaryItem = item;
      }
    }

    const sidecars = groupItems.filter((i) => i !== primaryItem);
    sidecars.sort((a, b) => a.name.localeCompare(b.name));
    primaryItem.sidecars = sidecars;
    result.push(primaryItem);
  }

  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

/**
 * Default singleton instance. Can be replaced with a remote/cloud provider.
 */
let currentFs: FileSystem | null = null;

export function getFileSystem(): FileSystem {
  if (!currentFs) {
    currentFs = new LocalFileSystem();
  }
  return currentFs;
}

export function setFileSystem(fs: FileSystem): void {
  currentFs = fs;
}
