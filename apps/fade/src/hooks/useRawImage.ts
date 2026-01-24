import { useSuspenseQuery } from "@tanstack/react-query";
import { createRawImageDataView } from "../lib/raw";
import { DimensionsTagId } from "../lib/raf";
import type { FileItem } from "../lib/fs";

export function useRawImage(fileItem: FileItem | null) {
  return useSuspenseQuery({
    queryKey: ["raw-image", fileItem?.handle.name],
    queryFn: async () => {
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
    },
    staleTime: Infinity,
  });
}
