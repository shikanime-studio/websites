import { useRef } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useDemosaic } from "../hooks/useDemosaic";
import { useRawImage } from "../hooks/useRawImage";
import type { FileItem } from "../lib/fs";

interface RawImageProps {
  fileItem: FileItem;
  exposure: number;
}

export function RawImage({ fileItem, exposure }: RawImageProps) {
  const { data: rawData } = useRawImage(fileItem);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { device, context } = useCanvas(canvasRef);

  const width = rawData?.width ?? 0;
  const height = rawData?.height ?? 0;
  const data = rawData?.data ?? new Uint16Array(0);

  useDemosaic(device, context, width, height, data, exposure);

  if (!rawData || width === 0 || height === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
    />
  );
}
