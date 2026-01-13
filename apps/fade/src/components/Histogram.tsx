import { useImageInfo } from "../hooks/useImageInfo";
import { useHistogram } from "../hooks/useHistogram";

interface HistogramProps {
  className?: string;
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

  return <HistogramContent className={className} image={image} />;
}
