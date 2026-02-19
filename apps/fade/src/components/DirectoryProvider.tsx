import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { DirectoryContext, useFileSystemSupport } from '../hooks/useDirectory'

export function DirectoryProvider({ children }: { children: ReactNode }) {
  const [handle, setHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const isSupported = useFileSystemSupport()

  const select = useCallback(async () => {
    try {
      // Check if the API is supported
      if (!isSupported) {
        console.warn(
          'Your browser does not support opening local directories.',
        )
        return
      }

      const dirHandle = await window.showDirectoryPicker()
      setHandle(dirHandle)
    }
    catch (error) {
      // User cancelled the picker
      if ((error as Error).name !== 'AbortError') {
        console.error(
          'Failed to open directory. Please try again or choose a different one.',
        )
      }
    }
  }, [isSupported])

  return (
    <DirectoryContext
      value={{
        handle,
        select,
        isSupported,
      }}
    >
      {children}
    </DirectoryContext>
  )
}
