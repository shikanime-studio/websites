import { useSuspenseQuery } from "@tanstack/react-query";
import { useFile } from "./useFile";
import type { FileItem } from "../lib/fs";

export function useThumbnail(
  fileItem: FileItem | null,
  width = 256,
  height = 256,
  quality = 1.0,
) {
  const { file, mimeType } = useFile(fileItem);

  const { data } = useSuspenseQuery({
    queryKey: ["thumbnail", fileItem?.handle.name, width, height, quality],
    queryFn: async () => {
      if (!file || !mimeType?.startsWith("image/")) {
        return null;
      }

      try {
        const bitmap = await createImageBitmap(file);

        // Calculate scaling to cover the requested width/height
        const scale = Math.max(width / bitmap.width, height / bitmap.height);

        const drawWidth = Math.round(bitmap.width * scale);
        const drawHeight = Math.round(bitmap.height * scale);

        const offsetX = (width - drawWidth) / 2;
        const offsetY = (height - drawHeight) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          bitmap.close();
          return null;
        }

        ctx.drawImage(bitmap, offsetX, offsetY, drawWidth, drawHeight);
        bitmap.close();

        return canvas.toDataURL("image/webp", quality);
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
  });

  return {
    mimeType,
    url: data,
  };
}
