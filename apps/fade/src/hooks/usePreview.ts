import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { previewAtom } from "../lib/photo-atoms";
import { useFile } from "./useFile";

export function usePreview(fileItem: FileItem | null) {
  const { file } = useFile(fileItem);
  return { blob: useAtomSuspense(previewAtom(fileItem, file)).value };
}
