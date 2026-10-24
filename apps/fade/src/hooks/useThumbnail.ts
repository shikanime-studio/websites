import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { thumbnailAtom } from "../lib/photo-atoms";

export function useThumbnail(
  fileItem: FileItem | null,
  width = 256,
  height = 256,
  quality = 1.0,
) {
  return {
    url: useAtomSuspense(
      thumbnailAtom(fileItem, width, height, quality),
    ).value,
  };
}
