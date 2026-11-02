import type { LightingKey } from "../lib/ui-atoms";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { useMemo } from "react";
import { lightingActionAtom, lightingAtom } from "../lib/ui-atoms";

/**
 * React binding only: subscribes to the lighting atom and maps the panel's
 * setter names onto the graph's set/reset transitions.
 */
export function useLighting() {
  const state = useAtomValue(lightingAtom);
  const dispatch = useAtomSet(lightingActionAtom);

  return useMemo(() => {
    const set = (key: LightingKey) => (value: number) => {
      dispatch({ _tag: "set", key, value });
    };
    const reset = (key: LightingKey) => () => {
      dispatch({ _tag: "reset", key });
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
  }, [state, dispatch]);
}
