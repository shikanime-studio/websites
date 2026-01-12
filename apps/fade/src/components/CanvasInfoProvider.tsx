import { useState } from "react";
import { CanvasInfoContext } from "../hooks/useCanvasInfo";
import type { ReactNode } from "react";

export function CanvasInfoProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [exposure, setExposure] = useState(0);

  return (
    <CanvasInfoContext.Provider
      value={{
        image,
        setImage,
        exposure,
        setExposure,
      }}
    >
      {children}
    </CanvasInfoContext.Provider>
  );
}
