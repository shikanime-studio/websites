import { useNavigate, useSearch } from "@tanstack/react-router";

export type ModalType = "settings" | "fullscreen" | undefined;

/** The modal lives in the URL, so it survives reloads and back/forward. */
export function useModal() {
  const { modal } = useSearch({ from: "/" });
  const navigate = useNavigate();

  const setModal = (next: ModalType) => {
    void navigate({
      to: "/",
      search: (prev: Record<string, unknown>) => ({ ...prev, modal: next }),
    });
  };

  return { modal, setModal };
}
