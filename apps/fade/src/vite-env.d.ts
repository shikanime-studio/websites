/// <reference types="vite/client" />

// File System Access API types
interface FileSystemDirectoryHandle {
  kind: "directory";
  name: string;
  values(): AsyncIterableIterator<FileSystemHandle>;
}

interface FileSystemFileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

interface Window {
  showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}
