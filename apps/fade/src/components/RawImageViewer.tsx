import { Suspense, useRef } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useDemosaic } from "../hooks/useDemosaic";
import { useModal } from "../hooks/useModal";
import { useRawImage } from "../hooks/useRawImage";
import { FullscreenModal } from "./FullscreenModal";
import { FullscreenNavigation } from "./FullscreenNavigation";
import type { FileItem } from "../lib/fs";

interface RawImageViewerProps {
  fileItem?: FileItem;
}

interface RawCanvasProps extends RawImageViewerProps {
  onDoubleClick?: () => void;
  className?: string;
}

function RawCanvas({ fileItem, onDoubleClick, className }: RawCanvasProps) {
  const { data: rawData } = useRawImage(fileItem ?? null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { context } = useCanvas(canvasRef);

  const width = rawData?.width ?? 0;
  const height = rawData?.height ?? 0;
  const data = rawData?.data ?? new Uint16Array(0);

  useDemosaic(context, width, height, data.buffer);

  return (
    <canvas
      ref={canvasRef}
      width={width || undefined}
      height={height || undefined}
      className={className}
      onDoubleClick={onDoubleClick}
    />
  );
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
        <RawCanvas
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
            <RawCanvas
              fileItem={fileItem}
              className="max-h-full max-w-full object-contain"
            />
          </Suspense>
        </FullscreenNavigation>
      </FullscreenModal>
    </>
  );
}
