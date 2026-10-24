import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { exifAtom } from "../lib/photo-atoms";

export function useExif(fileItem: FileItem | null) {
  return useAtomSuspense(exifAtom(fileItem)).value;
}
