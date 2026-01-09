import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ImageInfoContextType {
  width: number | null;
  height: number | null;
  setDimensions: (width: number, height: number) => void;
  resetDimensions: () => void;
}

const ImageInfoContext = createContext<ImageInfoContextType | null>(null);

export function ImageInfoProvider({ children }: { children: ReactNode }) {
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
    <ImageInfoContext.Provider
      value={{
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        setDimensions,
        resetDimensions,
      }}
    >
      {children}
    </ImageInfoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useImageInfo() {
  const context = useContext(ImageInfoContext);
  if (!context) {
    throw new Error("useImageInfo must be used within an ImageInfoProvider");
  }
  return context;
}
