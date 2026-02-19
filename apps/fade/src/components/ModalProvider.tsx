import type { NavigateOptions } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { ModalType } from '../hooks/useModal'
import { ModalContext } from '../hooks/useModal'

interface ModalProviderProps {
  children: ReactNode
  navigate: (opts: NavigateOptions) => Promise<void>
  search: { modal?: ModalType }
}

export function ModalProvider({
  children,
  navigate,
  search,
}: ModalProviderProps) {
  const { modal } = search

  const setModal = (newModal: ModalType) => {
    void navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, modal: newModal }),
    })
  }

  return <ModalContext value={{ modal, setModal }}>{children}</ModalContext>
}
