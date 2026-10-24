import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { fileAtom } from "../lib/photo-atoms";

export function useFile(fileItem: FileItem | null) {
  return { file: useAtomSuspense(fileAtom(fileItem)).value };
}
