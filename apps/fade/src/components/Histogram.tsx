import { Suspense } from "react";
import { useImageInfo } from "../hooks/useImageInfo";
import { useHistogram } from "../hooks/useHistogram";

interface HistogramProps {
  className?: string;
}

function HistogramSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`relative h-32 w-full bg-zinc-800/50 rounded-md overflow-hidden flex items-center justify-center ${className ?? ""}`}
    >
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
    </div>
  );
}

function HistogramContent({
  className,
  image,
}: HistogramProps & { image: HTMLImageElement }) {
  const data = useHistogram(image);

  if (!data) return null;

  return (
    <div
      className={`relative h-32 w-full bg-black rounded-md overflow-hidden ${className ?? ""}`}
    >
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

export function Histogram({ className }: HistogramProps) {
  const { image } = useImageInfo();

  if (!image) return null;

  return (
    <Suspense fallback={<HistogramSkeleton className={className} />}>
      <HistogramContent className={className} image={image} />
    </Suspense>
  );
}
