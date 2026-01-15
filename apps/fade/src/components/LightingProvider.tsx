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

  return (
    <LightingContext.Provider
      value={{
        exposure,
        setExposure,
        resetExposure: () => {
          setExposure(0);
        },
        contrast,
        setContrast,
        resetContrast: () => {
          setContrast(1);
        },
        saturation,
        setSaturation,
        resetSaturation: () => {
          setSaturation(1);
        },
        highlights,
        setHighlights,
        resetHighlights: () => {
          setHighlights(0);
        },
        shadows,
        setShadows,
        resetShadows: () => {
          setShadows(0);
        },
        whites,
        setWhites,
        resetWhites: () => {
          setWhites(0);
        },
        blacks,
        setBlacks,
        resetBlacks: () => {
          setBlacks(0);
        },
        tint,
        setTint,
        resetTint: () => {
          setTint(0);
        },
        temperature,
        setTemperature,
        resetTemperature: () => {
          setTemperature(0);
        },
        vibrance,
        setVibrance,
        resetVibrance: () => {
          setVibrance(0);
        },
        hue,
        setHue,
        resetHue: () => {
          setHue(0);
        },
      }}
    >
      {children}
    </LightingContext.Provider>
  );
}
