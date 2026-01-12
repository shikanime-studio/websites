import { useSuspenseQuery } from "@tanstack/react-query";
import { RafDataView } from "../lib/raw";
import type { FileItem } from "../lib/fs";

export function useFile(fileItem: FileItem | null) {
  const { data: file } = useSuspenseQuery({
    queryKey: ["file", fileItem?.handle.name],
    queryFn: async () => {
      if (!fileItem) return null;
      const originalFile = await fileItem.handle.getFile();
      if (fileItem.mimeType === "image/x-fujifilm-raf") {
        const buffer = await originalFile.arrayBuffer();
        const view = new RafDataView(buffer);
        const jpg = view.getEmbeddedImage();
        if (jpg) {
          return new Blob([jpg], { type: "image/jpeg" });
        }
      }
      return originalFile;
    },
    staleTime: Infinity,
  });

  return {
    file,
    mimeType: fileItem?.mimeType,
  };
}
