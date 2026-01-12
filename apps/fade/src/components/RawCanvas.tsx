import { useRef } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { useDemosaic } from "../hooks/useDemosaic";

interface RawCanvasProps {
  width: number;
  height: number;
  data: Uint16Array;
}

export function RawCanvas({ width, height, data }: RawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { device, context } = useCanvas(canvasRef);
  useDemosaic(device, context, width, height, data);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
    />
  );
}
