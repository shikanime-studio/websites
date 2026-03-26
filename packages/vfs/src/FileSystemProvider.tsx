import type { ReactNode } from 'react'
import { useState } from 'react'
import { FileSystemContext } from './hooks/fs'

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const [root, setRoot] = useState<FileSystemDirectoryHandle | null>(null)
  return (
    <FileSystemContext
      value={{
        root,
        setRoot,
      }}
    >
      {children}
    </FileSystemContext>
  )
}
