import type { ReactNode } from 'react'
import type { FileItem } from '../lib/fs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { fileTypeFromBlob } from 'file-type'
import { useCallback, useState } from 'react'
import { GalleryContext } from '../hooks/useGallery'
import { useKeymap } from '../hooks/useKeymap'
import { projectsCollection } from '../lib/db'
import { basenameWithoutExtension } from '../lib/fs'

async function scanAndIndexDirectory(
  directoryHandle: FileSystemDirectoryHandle,
): Promise<Array<FileItem>> {
  const items: Array<FileItem> = []

  for await (const handle of directoryHandle.values()) {
    if (handle.kind !== 'file')
      continue
    const fileHandle = handle as FileSystemFileHandle
    const file = await fileHandle.getFile()
    const type = await fileTypeFromBlob(file)
    items.push({
      handle: fileHandle,
      sidecars: [],
      mimeType: type?.mime,
    })
  }

  const groups = new Map<string, Array<FileItem>>()
  for (const item of items) {
    const name = item.handle.name
    const basename = basenameWithoutExtension(name)

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

  result.sort((a, b) => a.handle.name.localeCompare(b.handle.name))

  for (const item of result) {
    const name = item.handle.name
    const fullPath = `${directoryHandle.name}/${name}`
    try {
      projectsCollection.update(name, (draft) => {
        draft.path = fullPath
      })
    }
    catch {
      projectsCollection.insert({
        id: name,
        path: fullPath,
      })
    }
  }

  return result
}

export function GalleryProvider({
  children,
  handle,
}: {
  children: ReactNode
  handle: FileSystemDirectoryHandle | null
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { data: files } = useSuspenseQuery({
    queryKey: ['gallery', handle, handle?.name],
    queryFn: async () => {
      if (!handle)
        return []
      return scanAndIndexDirectory(handle)
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const selectFile = useCallback(
    (index: number) => {
      setSelectedIndex(Math.max(0, Math.min(index, files.length - 1)))
    },
    [files.length],
  )

  const navigateNext = useCallback(() => {
    setSelectedIndex(prev => Math.min(prev + 1, files.length - 1))
  }, [files.length])

  const navigatePrevious = useCallback(() => {
    setSelectedIndex(prev => Math.max(prev - 1, 0))
  }, [])

  useKeymap('navigateNext', () => {
    if (files.length === 0)
      return
    navigateNext()
  })

  useKeymap('navigatePrevious', () => {
    if (files.length === 0)
      return
    navigatePrevious()
  })

  useKeymap('selectFirst', () => {
    if (files.length === 0)
      return
    selectFile(0)
  })

  useKeymap('selectLast', () => {
    if (files.length === 0)
      return
    selectFile(files.length - 1)
  })

  const selectedFile = files.length > 0 ? files[selectedIndex] : null

  return (
    <GalleryContext
      value={{
        files,
        selectedIndex,
        selectFile,
        navigateNext,
        navigatePrevious,
        selectedFile,
      }}
    >
      {children}
    </GalleryContext>
  )
}
