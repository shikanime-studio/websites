import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { useMemo } from "react";
import { nullableAtom } from "../lib/atoms";
import { DimensionsTagId } from "../lib/raf";
import { createRawImageDataView } from "../lib/raw";

export function useRawImage(fileItem: FileItem | null) {
  const atom = useMemo(
    () =>
      nullableAtom(fileItem, "raw-image", async () => {
        if (!fileItem) return null;

        const view = await createRawImageDataView(fileItem);
        if (!view) return null;

        const data = view.getCfa();
        if (!data) return null;
        const header = view.getCfaHeader();
        if (!header) return null;
        const tags = header.getTagEntries();
        const dimEntry = tags.find(
          (t) => t.tagId === (DimensionsTagId as number),
        );

        let width = 0;
        let height = 0;

        if (dimEntry && Array.isArray(dimEntry.value)) {
          // Dimensions value is [height, width]
          [height, width] = dimEntry.value as [number, number];
        }

        return { width, height, data };
      }),
    [fileItem],
  );

  return useAtomSuspense(atom).value;
}
