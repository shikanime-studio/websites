import type { FC } from "react";
import { Activity, useState } from "react";

export interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
}

export const Image: FC<ImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
}) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  const finalSrc =
    status === "error"
      ? `https://placehold.co/${width}x${height}/f3f4f6/9ca3af?text=No+Image`
      : src;

  return (
    <div className={`relative w-full ${className}`}>
      <Activity mode={status === "loading" ? "visible" : "hidden"}>
        <div
          className="skeleton absolute inset-0 z-10 h-full w-full rounded-none"
          style={{ height, width }}
        />
      </Activity>
      <Activity mode={status === "loaded" ? "visible" : "hidden"}>
        <img
          src={finalSrc}
          alt={alt}
          width={width}
          height={height}
          className="h-full w-full object-cover transition-opacity duration-300"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      </Activity>
    </div>
  );
};
