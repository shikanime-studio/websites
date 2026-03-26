export interface FileItem {
  handle: FileSystemFileHandle
  sidecars: Array<FileItem>
  mimeType?: string
}
