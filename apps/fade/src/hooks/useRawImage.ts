import { useSuspenseQuery } from "@tanstack/react-query";
import { createRawImageDataView } from "../lib/raw";
import type { FileItem } from "../lib/fs";

export function useRawImage(fileItem: FileItem | null) {
  return useSuspenseQuery({
    queryKey: ["raw-image", fileItem?.handle.name],
    queryFn: async () => {
      if (!fileItem) return null;

      const view = await createRawImageDataView(fileItem);
      if (!view) return null;

      const raw = view.getRawData();

      if (!raw) return null;

      return raw;
    },
    staleTime: Infinity,
  });
}
