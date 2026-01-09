import { createContext, useContext } from "react";

interface CanvasInfoContextType {
  width: number | null;
  height: number | null;
  setDimensions: (width: number, height: number) => void;
  resetDimensions: () => void;
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
