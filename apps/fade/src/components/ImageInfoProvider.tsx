import { useState } from "react";
import { ImageInfoContext } from "../hooks/useImageInfo";
import type { ReactNode } from "react";

export function ImageInfoProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  return (
    <ImageInfoContext.Provider
      value={{
        image,
        setImage,
      }}
    >
      {children}
    </ImageInfoContext.Provider>
  );
}
