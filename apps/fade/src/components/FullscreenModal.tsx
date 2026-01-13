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
      className="modal bg-black/90"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <button
        className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4 text-white z-50"
        onClick={onClose}
      >
        ✕
      </button>
      <div
        className="modal-box max-w-none w-full h-full bg-transparent shadow-none p-0 flex items-center justify-center overflow-hidden rounded-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
