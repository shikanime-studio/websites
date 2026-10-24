import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { previewAtom } from "../lib/photo-atoms";

export function usePreview(fileItem: FileItem | null) {
  return { blob: useAtomSuspense(previewAtom(fileItem)).value };
}
