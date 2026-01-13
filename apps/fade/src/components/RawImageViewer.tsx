import { useRef } from "react";
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

export function RawImageViewer({ fileItem }: RawImageViewerProps) {
  const { modal, setModal } = useModal();

  return (
    <>
      <RawCanvas
        fileItem={fileItem}
        onDoubleClick={() => {
          setModal("fullscreen");
        }}
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
      />
      <FullscreenModal
        open={modal === "fullscreen"}
        onClose={() => {
          setModal(undefined);
        }}
      >
        <FullscreenNavigation>
          <RawCanvas
            fileItem={fileItem}
            className="max-h-full max-w-full object-contain"
          />
        </FullscreenNavigation>
      </FullscreenModal>
    </>
  );
}
