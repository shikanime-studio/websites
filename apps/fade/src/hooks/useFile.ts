import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { useMemo } from "react";
import { nullableAtom } from "../lib/atoms";

export function useFile(fileItem: FileItem | null) {
  const atom = useMemo(
    () =>
      nullableAtom(fileItem, "file", async () =>
        fileItem ? await fileItem.handle.getFile() : null,
      ),
    [fileItem],
  );
  const file = useAtomSuspense(atom).value;

  return { file };
}
