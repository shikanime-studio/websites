import { createContext, useContext } from "react";

export interface LightingContextType {
  exposure: number;
  setExposure: (value: number) => void;
  contrast: number;
  setContrast: (value: number) => void;
  saturation: number;
  setSaturation: (value: number) => void;
  highlights: number;
  setHighlights: (value: number) => void;
  shadows: number;
  setShadows: (value: number) => void;
  whites: number;
  setWhites: (value: number) => void;
  blacks: number;
  setBlacks: (value: number) => void;
  tint: number;
  setTint: (value: number) => void;
  temperature: number;
  setTemperature: (value: number) => void;
  vibrance: number;
  setVibrance: (value: number) => void;
  hue: number;
  setHue: (value: number) => void;
  reset: () => void;
}

export const LightingContext = createContext<LightingContextType | null>(null);

export function useLighting() {
  const context = useContext(LightingContext);
  if (!context) {
    throw new Error("useLighting must be used within a LightingProvider");
  }
  return context;
}
