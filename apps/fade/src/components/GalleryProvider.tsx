import type { ReactNode } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { GalleryContext } from '../hooks/useGallery'
import { useKeymap } from '../hooks/useKeymap'
import { scanDirectory } from '../lib/fs'

export function GalleryProvider({
  children,
  handle,
}: {
  children: ReactNode
  handle: FileSystemDirectoryHandle | null
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const { data: files } = useSuspenseQuery({
    queryKey: ['gallery', handle?.name],
    queryFn: async () => {
      if (!handle)
        return []
      return scanDirectory(handle)
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
