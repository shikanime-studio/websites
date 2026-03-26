import type { ReactNode } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import { GalleryContext } from '../hooks/useGallery'
import { useKeymap } from '../hooks/useKeymap'
import { scanDirectory } from '../lib/fs'
import { directoryHandleKey } from '../lib/queryKey'

export function GalleryProvider({
  children,
  handle,
  selectedPath,
  setSelectedPath,
}: {
  children: ReactNode
  handle: FileSystemDirectoryHandle | null
  selectedPath: string | undefined
  setSelectedPath: (path?: string, opts?: { replace?: boolean }) => void
}) {
  const { data: files } = useSuspenseQuery({
    queryKey: ['gallery', directoryHandleKey(handle)],
    queryFn: async () => {
      if (!handle)
        return []
      return scanDirectory(handle)
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const selectedIndex = useMemo(() => {
    if (files.length === 0)
      return 0
    if (!selectedPath)
      return 0
    const index = files.findIndex(f => f.handle.name === selectedPath)
    return index === -1 ? 0 : index
  }, [files, selectedPath])

  useEffect(() => {
    if (files.length === 0)
      return

    const desiredPath
      = selectedPath && files.some(f => f.handle.name === selectedPath)
        ? selectedPath
        : files[0]?.handle.name

    if (!desiredPath)
      return

    if (desiredPath !== selectedPath) {
      setSelectedPath(desiredPath, { replace: true })
    }
  }, [files, selectedPath, setSelectedPath])

  const selectFile = useCallback(
    (index: number) => {
      const next = files[Math.max(0, Math.min(index, files.length - 1))]
      if (!next)
        return
      setSelectedPath(next.handle.name)
    },
    [files, setSelectedPath],
  )

  const navigateNext = useCallback(() => {
    const nextIndex = Math.min(selectedIndex + 1, files.length - 1)
    const next = files[nextIndex]
    if (!next)
      return
    setSelectedPath(next.handle.name)
  }, [files, selectedIndex, setSelectedPath])

  const navigatePrevious = useCallback(() => {
    const nextIndex = Math.max(selectedIndex - 1, 0)
    const next = files[nextIndex]
    if (!next)
      return
    setSelectedPath(next.handle.name)
  }, [files, selectedIndex, setSelectedPath])

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

  const selectedFile = files[selectedIndex] ?? null

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
