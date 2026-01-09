import { useState } from "react";
import { CanvasInfoContext } from "../hooks/useCanvasInfo";
import type { ReactNode } from "react";

export function CanvasInfoProvider({ children }: { children: ReactNode }) {
  const [dimensions, setDimensionsState] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const setDimensions = (width: number, height: number) => {
    setDimensionsState({ width, height });
  };

  const resetDimensions = () => {
    setDimensionsState(null);
  };

  return (
    <CanvasInfoContext.Provider
      value={{
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        setDimensions,
        resetDimensions,
      }}
    >
      {children}
    </CanvasInfoContext.Provider>
  );
}
