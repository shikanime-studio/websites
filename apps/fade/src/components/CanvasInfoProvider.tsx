import { useState } from "react";
import { CanvasInfoContext } from "../hooks/useCanvasInfo";
import type { ReactNode } from "react";

export function CanvasInfoProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  return (
    <CanvasInfoContext.Provider
      value={{
        image,
        setImage,
      }}
    >
      {children}
    </CanvasInfoContext.Provider>
  );
}
