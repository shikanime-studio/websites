import { createContext, useContext } from "react";

export type ModalType = "settings" | "fullscreen" | undefined;

export interface ModalContextType {
  modal: ModalType;
  setModal: (modal: ModalType) => void;
}

export const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
