import type { Mixpanel } from "mixpanel-browser";
import type { Theme } from "./db";
import { make } from "effect/reactivity/Atom";

/** The loaded <img> element shared with the info panel. */
export const imageElementAtom = make<HTMLImageElement | null>(null);
/** Persisted light/dark preference. */
export const themeAtom = make<Theme | undefined>(undefined);
/** The chosen directory handle. */
export const directoryHandleAtom = make<FileSystemDirectoryHandle | null>(null);
/** Index of the selected file in the gallery. */
export const selectedIndexAtom = make(0);
/** Initialised Mixpanel instance. */
export const mixpanelInstanceAtom = make<Mixpanel | undefined>(undefined);

export interface LightingState {
  exposure: number;
  contrast: number;
  saturation: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  tint: number;
  temperature: number;
  vibrance: number;
  hue: number;
}

export const DEFAULT_LIGHTING: LightingState = {
  exposure: 0,
  contrast: 1,
  saturation: 1,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  tint: 0,
  temperature: 0,
  vibrance: 0,
  hue: 0,
};

export const lightingAtom = make<LightingState>(DEFAULT_LIGHTING);
