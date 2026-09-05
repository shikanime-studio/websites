import type { ReactNode } from "react";
import { IconButton } from "@astryxdesign/core/IconButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGallery } from "../hooks/useGallery";
import { useModal } from "../hooks/useModal";

interface FullscreenNavigationProps {
  children: ReactNode;
}

export function FullscreenNavigation({ children }: FullscreenNavigationProps) {
  const { navigateNext, navigatePrevious, files } = useGallery();
  const { setModal } = useModal();

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setModal(undefined);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setModal(undefined);
        }
      }}
    >
      {files.length > 1 && (
        <IconButton
          className="text-on-dark absolute left-4 z-50"
          variant="ghost"
          label="Previous file"
          icon={<ChevronLeft className="h-8 w-8" />}
          onClick={(e) => {
            e.stopPropagation();
            navigatePrevious();
          }}
        />
      )}
      {children}
      {files.length > 1 && (
        <IconButton
          className="text-on-dark absolute right-4 z-50"
          variant="ghost"
          label="Next file"
          icon={<ChevronRight className="h-8 w-8" />}
          onClick={(e) => {
            e.stopPropagation();
            navigateNext();
          }}
        />
      )}
    </div>
  );
}
