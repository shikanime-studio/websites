import { IconButton } from "@astryxdesign/core/IconButton";
import { ClientOnly } from "@tanstack/react-router";
import { X } from "lucide-react";
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
      <IconButton
        icon={<X className="text-on-dark h-5 w-5" />}
        label="Close fullscreen"
        variant="ghost"
        className="absolute top-4 right-4 z-50"
        onClick={onClose}
      />
      <div className="flex h-full w-full items-center justify-center overflow-hidden p-0">
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
