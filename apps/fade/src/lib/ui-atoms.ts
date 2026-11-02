import type { Mixpanel } from "mixpanel-browser";
import type { Theme } from "./settings";
import { make, writable } from "effect/reactivity/Atom";

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

export type LightingKey = keyof LightingState;

export type LightingAction =
  | { readonly _tag: "set"; readonly key: LightingKey; readonly value: number }
  | { readonly _tag: "reset"; readonly key: LightingKey };

/**
 * Lighting transitions live next to the state they change: a set merges one
 * channel, a reset restores that channel's default. Components dispatch these
 * instead of rebuilding setter closures on every render.
 */
export const lightingActionAtom = writable(
  (get) => get(lightingAtom),
  (ctx, action: LightingAction) => {
    const current = ctx.get(lightingAtom);
    const value
      = action._tag === "set" ? action.value : DEFAULT_LIGHTING[action.key];
    ctx.set(lightingAtom, { ...current, [action.key]: value });
  },
);
