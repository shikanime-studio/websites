import { ModalContext } from "../hooks/useModal";
import type { ModalType } from "../hooks/useModal";
import type { NavigateOptions } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface ModalProviderProps {
  children: ReactNode;
  navigate: (opts: NavigateOptions) => Promise<void>;
  search: { modal?: ModalType };
}

export function ModalProvider({
  children,
  navigate,
  search,
}: ModalProviderProps) {
  const { modal } = search;

  const setModal = (newModal: ModalType) => {
    void navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, modal: newModal }),
    });
  };

  return (
    <ModalContext.Provider value={{ modal, setModal }}>
      {children}
    </ModalContext.Provider>
  );
}
