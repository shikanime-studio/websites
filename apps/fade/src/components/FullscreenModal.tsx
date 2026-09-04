import { ClientOnly } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface FullscreenModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function FullscreenModal(props: FullscreenModalProps) {
  return (
    <ClientOnly fallback={null}>
      <FullscreenModalContent {...props} />
    </ClientOnly>
  );
}

function FullscreenModalContent({
  open,
  onClose,
  children,
}: FullscreenModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  return createPortal(
    <dialog
      ref={dialogRef}
      className="bg-[var(--color-overlay)]"
      onClose={onClose}
    >
      <button
        className="text-on-dark absolute top-4 right-4 z-50 cursor-pointer bg-transparent p-2"
        onClick={onClose}
        aria-label="Close fullscreen"
        type="button"
      >
        ✕
      </button>
      <div className="flex h-full w-full items-center justify-center overflow-hidden p-0">
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
