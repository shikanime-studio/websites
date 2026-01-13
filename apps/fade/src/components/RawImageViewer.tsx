import { Suspense } from "react";
import { useModal } from "../hooks/useModal";
import { FullscreenModal } from "./FullscreenModal";
import { FullscreenNavigation } from "./FullscreenNavigation";
import { RawImageRender } from "./RawImageRender";
import type { FileItem } from "../lib/fs";

interface RawImageViewerProps {
  fileItem?: FileItem;
}

function RawCanvasSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`${className ?? ""} flex items-center justify-center bg-zinc-800/50`}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" />
    </div>
  );
}

export function RawImageViewer({ fileItem }: RawImageViewerProps) {
  const { modal, setModal } = useModal();

  return (
    <>
      <Suspense
        fallback={
          <RawCanvasSkeleton className="aspect-square h-full max-h-full w-full max-w-full rounded-lg shadow-2xl" />
        }
      >
        <RawImageRender
          fileItem={fileItem}
          onDoubleClick={() => {
            setModal("fullscreen");
          }}
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        />
      </Suspense>
      <FullscreenModal
        open={modal === "fullscreen"}
        onClose={() => {
          setModal(undefined);
        }}
      >
        <FullscreenNavigation>
          <Suspense
            fallback={
              <RawCanvasSkeleton className="h-full max-h-full w-full max-w-full" />
            }
          >
            <RawImageRender
              fileItem={fileItem}
              className="max-h-full max-w-full object-contain"
            />
          </Suspense>
        </FullscreenNavigation>
      </FullscreenModal>
    </>
  );
}
