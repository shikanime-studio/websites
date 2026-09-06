import type { FileItem } from "@shikanime-studio/fs";
import { useRef } from "react";
import { useLighting } from "../hooks/useLighting";
import { useRawImage } from "@shikanime-studio/darkroom/react";
import { useRawImageRender } from "../hooks/useRawImageRender";

interface RawImageRenderProps {
  fileItem?: FileItem | undefined;
  className?: string;
  onDoubleClick?: () => void;
}

export function RawImageRender({
  fileItem,
  className,
  onDoubleClick,
}: RawImageRenderProps) {
  const { data: rawData } = useRawImage(fileItem ?? null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lighting = useLighting();

  const width = rawData?.width ?? 0;
  const height = rawData?.height ?? 0;
  const data = rawData?.data ?? new Uint16Array(0);

  useRawImageRender(canvasRef, width, height, data.buffer, lighting);

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
