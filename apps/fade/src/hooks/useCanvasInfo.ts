import { createContext, useContext } from "react";

interface CanvasInfoContextType {
  image: HTMLImageElement | null;
  setImage: (image: HTMLImageElement | null) => void;
  exposure: number;
  setExposure: (exposure: number) => void;
}

export const CanvasInfoContext = createContext<CanvasInfoContextType | null>(
  null,
);

export function useCanvasInfo() {
  const context = useContext(CanvasInfoContext);
  if (!context) {
    throw new Error("useCanvasInfo must be used within a CanvasInfoProvider");
  }
  return context;
}
