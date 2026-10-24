import { useAtomSuspense } from "@effect/atom-react";
import { histogramAtom } from "../lib/photo-atoms";

export function useHistogram(image: HTMLImageElement | null) {
  return useAtomSuspense(histogramAtom(image)).value;
}
