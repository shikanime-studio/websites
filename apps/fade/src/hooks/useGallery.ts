import type { GalleryView } from "../lib/gallery-atoms";
import { useAtomSet, useAtomSuspense } from "@effect/atom-react";
import { useMemo } from "react";
import { galleryActionAtom, galleryViewAtom } from "../lib/gallery-atoms";

export interface GalleryValue extends GalleryView {
  selectFile: (index: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
}

/**
 * React binding only: subscribes to the gallery atoms and hands components
 * stable callbacks. The clamping and the index transitions live in the graph.
 */
export function useGallery(): GalleryValue {
  const view = useAtomSuspense(galleryViewAtom).value;
  const dispatch = useAtomSet(galleryActionAtom);

  const actions = useMemo(
    () => ({
      selectFile: (index: number) => {
        dispatch({ _tag: "select", index });
      },
      navigateNext: () => {
        dispatch({ _tag: "next" });
      },
      navigatePrevious: () => {
        dispatch({ _tag: "previous" });
      },
    }),
    [dispatch],
  );

  return { ...view, ...actions };
}
