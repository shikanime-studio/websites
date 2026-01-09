import { useMemo } from "react";
import { useCanvasInfo } from "../hooks/useCanvasInfo";

interface HistogramProps {
  className?: string;
}

export function Histogram({ className }: HistogramProps) {
  const { image } = useCanvasInfo();

  const data = useMemo(() => {
    if (!image) {
      return null;
    }

    const canvas = document.createElement("canvas");
    // Use a smaller size for performance, still enough for histogram
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // Draw image to small canvas
    ctx.drawImage(image, 0, 0, size, size);
    const imageData = ctx.getImageData(0, 0, size, size);
    const pixels = imageData.data;

    const r = new Array<number>(256).fill(0);
    const g = new Array<number>(256).fill(0);
    const b = new Array<number>(256).fill(0);

    // Count pixel values
    for (let i = 0; i < pixels.length; i += 4) {
      r[pixels[i]]++;
      g[pixels[i + 1]]++;
      b[pixels[i + 2]]++;
    }

    // Find max value to normalize
    const maxCount = Math.max(
      ...r,
      ...g,
      ...b
    );

    // Normalize to 0-100 range
    const normalize = (arr: Array<number>) =>
      arr.map((v) => (v / maxCount) * 100);

    return {
      r: normalize(r),
      g: normalize(g),
      b: normalize(b),
    };
  }, [image]);

  if (!data) return null;

  return (
    <div className={`relative h-32 w-full bg-black/20 rounded-md overflow-hidden ${className ?? ""}`}>
      <svg
        viewBox="0 0 256 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <g>
          <path
            d={`M0,100 ${data.r
              .map((v, i) => `L${i.toString()},${(100 - v).toString()}`)
              .join(" ")} L255,100 Z`}
            fill="#ff0000"
            className="opacity-80"
            style={{ mixBlendMode: "screen" }}
          />
          <path
            d={`M0,100 ${data.g
              .map((v, i) => `L${i.toString()},${(100 - v).toString()}`)
              .join(" ")} L255,100 Z`}
            fill="#00ff00"
            className="opacity-80"
            style={{ mixBlendMode: "screen" }}
          />
          <path
            d={`M0,100 ${data.b
              .map((v, i) => `L${i.toString()},${(100 - v).toString()}`)
              .join(" ")} L255,100 Z`}
            fill="#0000ff"
            className="opacity-80"
            style={{ mixBlendMode: "screen" }}
          />
        </g>
      </svg>
    </div>
  );
}
