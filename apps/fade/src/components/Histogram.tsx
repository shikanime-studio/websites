import { Spinner } from "@astryxdesign/core/Spinner";
import { useAtomSuspense, useAtomValue  } from "@effect/atom-react";
import { Suspense } from "react";
import { histogramAtom } from "../lib/photo-atoms";
import { imageElementAtom } from "../lib/ui-atoms";

interface HistogramProps {
  className?: string;
}

function HistogramSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md bg-overlay ${className}`}
    >
      <Spinner aria-label="Loading histogram" />
    </div>
  );
}

function HistogramContent({
  className = "",
  image,
}: HistogramProps & { image: HTMLImageElement }) {
  const data = useAtomSuspense(histogramAtom(image)).value;

  if (!data) return null;

  return (
    <div
      className={`relative h-32 w-full overflow-hidden rounded-md bg-black ${className}`}
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

export function Histogram({ className = "" }: HistogramProps) {
  const image = useAtomValue(imageElementAtom);

  if (!image) return null;

  return (
    <Suspense fallback={<HistogramSkeleton className={className} />}>
      <HistogramContent className={className} image={image} />
    </Suspense>
  );
}
