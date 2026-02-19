import { fileTypeFromBlob } from 'file-type'

export interface FileItem {
  handle: FileSystemFileHandle
  sidecars: Array<FileItem>
  mimeType?: string
}

export async function scanDirectory(
  directoryHandle: FileSystemDirectoryHandle,
): Promise<Array<FileItem>> {
  const handles: Array<FileSystemFileHandle> = []

  for await (const handle of directoryHandle.values()) {
    if (handle.kind === 'file') {
      handles.push(handle)
    }
  }

  const items = await Promise.all(
    handles.map(async (handle) => {
      const file = await handle.getFile()
      const type = await fileTypeFromBlob(file)
      return {
        handle,
        sidecars: [],
        mimeType: type?.mime,
      } as FileItem
    }),
  )

  const groups = new Map<string, Array<FileItem>>()

  for (const item of items) {
    const name = item.handle.name
    const lastDotIndex = name.lastIndexOf('.')
    const basename
      = lastDotIndex === -1 ? name : name.substring(0, lastDotIndex)

    let group = groups.get(basename)
    if (!group) {
      group = []
      groups.set(basename, group)
    }
    group.push(item)
  }

  const result: Array<FileItem> = []

  for (const groupItems of groups.values()) {
    let primaryItem = groupItems[0]
    let bestScore = -1

    for (const item of groupItems) {
      let score = 0
      if (item.mimeType?.startsWith('image/')) {
        score = 2
      }
      else if (item.mimeType?.startsWith('video/')) {
        score = 2
      }
      else {
        score = 1
      }

      if (score > bestScore) {
        bestScore = score
        primaryItem = item
      }
    }

    const sidecars = groupItems.filter(i => i !== primaryItem)
    sidecars.sort((a, b) => a.handle.name.localeCompare(b.handle.name))

    primaryItem.sidecars = sidecars
    result.push(primaryItem)
  }

  // Sort by filename
  result.sort((a, b) => a.handle.name.localeCompare(b.handle.name))

  return result
}
