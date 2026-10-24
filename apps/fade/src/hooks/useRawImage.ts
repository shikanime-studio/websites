import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { rawImageAtom } from "../lib/photo-atoms";

export function useRawImage(fileItem: FileItem | null) {
  return useAtomSuspense(rawImageAtom(fileItem)).value;
}
