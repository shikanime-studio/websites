import { useInfiniteQuery, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createContext, use, useEffect } from 'react'

export interface FileSystemContextValue {
  root: FileSystemDirectoryHandle | null
  setRoot: (root: FileSystemDirectoryHandle | null) => void
}

export const FileSystemContext = createContext<FileSystemContextValue | null>(null)

export function useFileSystem() {
  const context = use(FileSystemContext)
  if (!context)
    throw new Error('useFileSystem must be used within a FileSystemProvider')
  return context
}

export function useFileSystemPicker() {
  const { setRoot } = useFileSystem()

  return useMutation({
    mutationFn: async () => {
      return window.showDirectoryPicker()
    },
    onSuccess: (handle) => {
      setRoot(handle)
    },
  })
}

async function resolveDirectory(
  root: FileSystemDirectoryHandle,
  path: string,
  options?: FileSystemGetDirectoryOptions,
) {
  let current = root
  for (const part of path.split('/').filter(Boolean)) {
    current = await current.getDirectoryHandle(part, options)
  }
  return current
}

export function useRelativeDirectory(
  path: string,
  options?: FileSystemGetDirectoryOptions,
) {
  const { root } = useFileSystem()

  return useSuspenseQuery({
    queryKey: ['fs', 'relative-directory', root, path, options],
    queryFn: async (): Promise<FileSystemDirectoryHandle> => {
      if (!root)
        throw new Error('No root directory selected')
      return resolveDirectory(root, path, options)
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export function useRelativeFile(
  path: string,
  options?: {
    directory?: FileSystemGetDirectoryOptions
    file?: FileSystemGetFileOptions
  },
) {
  const { root } = useFileSystem()

  return useSuspenseQuery({
    queryKey: ['fs', 'relative-file', root, path, options?.directory, options?.file],
    queryFn: async (): Promise<FileSystemFileHandle> => {
      if (!root)
        throw new Error('No root directory selected')

      const parts = path.split('/').filter(Boolean)
      const basename = parts.at(-1)
      if (!basename)
        throw new Error('Path must not be empty')

      const parentPath = parts.slice(0, -1).join('/')
      const parent = await resolveDirectory(root, parentPath, options?.directory)
      return parent.getFileHandle(basename, options?.file)
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export function useFile(
  path: string,
  options?: {
    directory?: FileSystemGetDirectoryOptions
    file?: FileSystemGetFileOptions
  },
) {
  return useRelativeFile(path, options)
}

export function useWritableFile(
  path: string,
  options?: {
    directory?: FileSystemGetDirectoryOptions
    file?: FileSystemGetFileOptions
  },
) {
  const { data: file } = useRelativeFile(path, {
    directory: options?.directory ?? { create: true },
    file: options?.file ?? { create: true },
  })
  const result = useSuspenseQuery({
    queryKey: ['fs', 'writable', file],
    queryFn: async (): Promise<FileSystemWritableFileStream> => {
      return file.createWritable()
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  useEffect(() => {
    return () => {
      if (!result.data)
        return
      void result.data.close()
    }
  }, [result.data])

  return result
}

export function useDirectory(
  path: string,
  options?: {
    directory?: FileSystemGetDirectoryOptions
    pageSize?: number
  },
) {
  const { root } = useFileSystem()
  const pageSize = options?.pageSize ?? 100

  return useInfiniteQuery({
    queryKey: ['fs', 'directory', root, path, options?.directory, pageSize],
    queryFn: async ({ pageParam = 0 }): Promise<Array<FileSystemHandle>> => {
      if (!root)
        return []

      const handle = await resolveDirectory(root, path, options?.directory)
      const startIndex = pageParam * pageSize
      const entries: Array<FileSystemHandle> = []
      let index = 0

      for await (const h of handle.values()) {
        if (index >= startIndex && entries.length < pageSize) {
          entries.push(h)
        }
        index++
        if (entries.length >= pageSize)
          break
      }

      return entries
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length < pageSize ? undefined : pages.length,
    initialPageParam: 0,
    staleTime: Infinity,
  })
}
