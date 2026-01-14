import { useState } from "react";
import { LightingContext } from "../hooks/useLighting";
import type { ReactNode } from "react";

interface LightingProviderProps {
  children: ReactNode;
}

export function LightingProvider({ children }: LightingProviderProps) {
  const [exposure, setExposure] = useState(0);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [whites, setWhites] = useState(0);
  const [blacks, setBlacks] = useState(0);
  const [tint, setTint] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [vibrance, setVibrance] = useState(0);
  const [hue, setHue] = useState(0);

  const reset = () => {
    setExposure(0);
    setContrast(1);
    setSaturation(1);
    setHighlights(0);
    setShadows(0);
    setWhites(0);
    setBlacks(0);
    setTint(0);
    setTemperature(0);
    setVibrance(0);
    setHue(0);
  };

  return (
    <LightingContext.Provider
      value={{
        exposure,
        setExposure,
        contrast,
        setContrast,
        saturation,
        setSaturation,
        highlights,
        setHighlights,
        shadows,
        setShadows,
        whites,
        setWhites,
        blacks,
        setBlacks,
        tint,
        setTint,
        temperature,
        setTemperature,
        vibrance,
        setVibrance,
        hue,
        setHue,
        reset,
      }}
    >
      {children}
    </LightingContext.Provider>
  );
}
