import { useSuspenseQuery } from "@tanstack/react-query";
import { RafDataView } from "../lib/raf";
import { useFile } from "./useFile";
import type { FileItem } from "../lib/fs";

export function usePreview(fileItem: FileItem | null) {
  const { file, mimeType } = useFile(fileItem);

  const { data: blob } = useSuspenseQuery({
    queryKey: ["preview-blob", file?.name, file?.lastModified],
    queryFn: async () => {
      if (!file) return null;

      if (mimeType === "image/x-fujifilm-raf") {
        const buffer = await file.arrayBuffer();
        const view = new RafDataView(buffer);
        const jpgView = view.getJpegImage();
        if (!jpgView) return null;
        return new Blob([jpgView as unknown as BlobPart], {
          type: "image/jpeg",
        });
      }

      return file;
    },
    staleTime: Infinity,
  });

  return { blob, mimeType };
}
