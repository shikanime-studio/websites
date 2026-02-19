import { createContext, use, useMemo } from 'react'

export interface DirectoryContextValue {
  handle: FileSystemDirectoryHandle | null
  select: () => Promise<void>
  isSupported: boolean
}

export const DirectoryContext = createContext<DirectoryContextValue | null>(
  null,
)

export function useDirectory() {
  const context = use(DirectoryContext)
  if (!context) {
    throw new Error('useDirectory must be used within a DirectoryProvider')
  }
  return context
}

export function useFileSystemSupport() {
  return useMemo(() => {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window
  }, [])
}
