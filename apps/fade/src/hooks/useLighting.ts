import type { LightingState } from "../lib/ui-atoms";
import { useAtom } from "@effect/atom-react";
import { DEFAULT_LIGHTING, lightingAtom } from "../lib/ui-atoms";

type NumericKey = keyof LightingState;

export function useLighting() {
  const [state, setState] = useAtom(lightingAtom);

  const set = (key: NumericKey) => (value: number) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };
  const reset = (key: NumericKey) => () => {
    setState((prev) => ({ ...prev, [key]: DEFAULT_LIGHTING[key] }));
  };

  return {
    ...state,
    setExposure: set("exposure"),
    resetExposure: reset("exposure"),
    setContrast: set("contrast"),
    resetContrast: reset("contrast"),
    setSaturation: set("saturation"),
    resetSaturation: reset("saturation"),
    setHighlights: set("highlights"),
    resetHighlights: reset("highlights"),
    setShadows: set("shadows"),
    resetShadows: reset("shadows"),
    setWhites: set("whites"),
    resetWhites: reset("whites"),
    setBlacks: set("blacks"),
    resetBlacks: reset("blacks"),
    setTint: set("tint"),
    resetTint: reset("tint"),
    setTemperature: set("temperature"),
    resetTemperature: reset("temperature"),
    setVibrance: set("vibrance"),
    resetVibrance: reset("vibrance"),
    setHue: set("hue"),
    resetHue: reset("hue"),
  };
}
