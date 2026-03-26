import type { ReactNode } from 'react'
import type { FileItem } from '../lib/fs'
import { useDirectory } from '@shikanime-studio/vfs/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo } from 'react'
import { GalleryContext } from '../hooks/useGallery'
import { useKeymap } from '../hooks/useKeymap'
import { fileHandleKey } from '../lib/queryKey'

function inferMimeType(fileName: string): string | undefined {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    case 'avif':
      return 'image/avif'
    case 'raf':
      return 'image/x-fujifilm-raf'
    case 'mp4':
      return 'video/mp4'
    case 'mov':
      return 'video/quicktime'
    default:
      return undefined
  }
}

export function GalleryProvider({
  children,
}: {
  children: ReactNode
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pathname = useRouterState({ select: s => s.location.pathname })
  const directoryPath = pathname.slice(1)
  const selectedName = useRouterState({
    select: s => (s.location.search as { selected?: string } | undefined)?.selected,
  })

  const dir = useDirectory(directoryPath, { pageSize: 200 })

  const navigateToSelection = useCallback(
    async (nextSelected: string, opts?: { replace?: boolean }) => {
      const replace = opts?.replace
      if (directoryPath) {
        const next = {
          to: '/$path',
          params: { path: directoryPath },
          search: (prev: Record<string, unknown>) => ({ ...prev, selected: nextSelected }),
        } as const
        if (replace === undefined) {
          await navigate(next)
        }
        else {
          await navigate({ ...next, replace })
        }
        return
      }

      const next = {
        to: '/',
        search: (prev: Record<string, unknown>) => ({ ...prev, selected: nextSelected }),
      } as const
      if (replace === undefined) {
        await navigate(next)
      }
      else {
        await navigate({ ...next, replace })
      }
    },
    [directoryPath, navigate],
  )

  const prefetchFile = useCallback(
    async (fileItem: FileItem) => {
      const handle = fileItem.handle
      const key = fileHandleKey(handle)
      if (!key)
        return

      await queryClient.ensureQueryData({
        queryKey: ['file', key],
        queryFn: async () => await handle.getFile(),
        staleTime: Infinity,
      })
    },
    [queryClient],
  )

  const files = useMemo<Array<FileItem>>(() => {
    const handles = dir.data?.pages.flatMap(page => page) ?? []
    return handles
      .filter(h => h.kind === 'file')
      .map((h) => {
        const mimeType = inferMimeType(h.name)
        if (!mimeType) {
          return {
            handle: h as FileSystemFileHandle,
            sidecars: [],
          }
        }

        return {
          handle: h as FileSystemFileHandle,
          sidecars: [],
          mimeType,
        }
      })
  }, [dir.data?.pages])

  const selectedIndex = useMemo(() => {
    if (files.length === 0)
      return 0
    if (!selectedName)
      return 0
    const index = files.findIndex(f => f.handle.name === selectedName)
    return index === -1 ? 0 : index
  }, [files, selectedName])

  useEffect(() => {
    if (files.length === 0)
      return

    if (selectedName && !files.some(f => f.handle.name === selectedName)) {
      if (dir.hasNextPage && !dir.isFetchingNextPage) {
        void dir.fetchNextPage()
        return
      }
    }

    const desiredName
      = selectedName && files.some(f => f.handle.name === selectedName)
        ? selectedName
        : files[0]?.handle.name

    if (!desiredName)
      return

    if (desiredName !== selectedName) {
      const next = files.find(f => f.handle.name === desiredName)
      if (next) {
        void (async () => {
          try {
            await prefetchFile(next)
          }
          catch (err) {
            void err
          }
          await navigateToSelection(desiredName, { replace: true })
        })()
      }
    }
  }, [dir, files, selectedName, navigateToSelection, prefetchFile])

  const selectFile = useCallback(
    (index: number) => {
      const next = files[Math.max(0, Math.min(index, files.length - 1))]
      if (!next)
        return
      void (async () => {
        try {
          await prefetchFile(next)
        }
        catch (err) {
          void err
        }
        await navigateToSelection(next.handle.name)
      })()
    },
    [files, navigateToSelection, prefetchFile],
  )

  const navigateNext = useCallback(() => {
    const nextIndex = Math.min(selectedIndex + 1, files.length - 1)
    const next = files[nextIndex]
    if (!next)
      return
    void (async () => {
      try {
        await prefetchFile(next)
      }
      catch (err) {
        void err
      }
      await navigateToSelection(next.handle.name)
    })()
  }, [files, selectedIndex, navigateToSelection, prefetchFile])

  const navigatePrevious = useCallback(() => {
    const nextIndex = Math.max(selectedIndex - 1, 0)
    const next = files[nextIndex]
    if (!next)
      return
    void (async () => {
      try {
        await prefetchFile(next)
      }
      catch (err) {
        void err
      }
      await navigateToSelection(next.handle.name)
    })()
  }, [files, selectedIndex, navigateToSelection, prefetchFile])

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
        fetchMore: () => {
          if (dir.hasNextPage && !dir.isFetchingNextPage) {
            void dir.fetchNextPage()
          }
        },
        hasMore: dir.hasNextPage ?? false,
        isFetchingMore: dir.isFetchingNextPage,
      }}
    >
      {children}
    </GalleryContext>
  )
}
