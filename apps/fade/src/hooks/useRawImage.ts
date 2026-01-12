import { useQuery } from "@tanstack/react-query";
import { RafDataView } from "../lib/raw";
import type { FileItem } from "../lib/fs";

export function useRawImage(fileItem: FileItem | null) {
  return useQuery({
    queryKey: ["raw-image", fileItem?.handle.name],
    queryFn: async () => {
      if (!fileItem) return null;
      if (fileItem.mimeType !== "image/x-fujifilm-raf") return null;

      const file = await fileItem.handle.getFile();
      const buffer = await file.arrayBuffer();
      const view = new RafDataView(buffer);
      const raw = view.getRawData();

      if (!raw) return null;

      return raw;
    },
    enabled: !!fileItem && fileItem.mimeType === "image/x-fujifilm-raf",
    staleTime: Infinity,
  });
}
