import { useSuspenseQuery } from "@tanstack/react-query";
import { useFile } from "./useFile";

export function useThumbnail(
  handle: FileSystemFileHandle | null,
  width = 256,
  height = 256,
) {
  const { file, mimeType } = useFile(handle);

  const { data } = useSuspenseQuery({
    queryKey: ["thumbnail", handle?.name, width, height],
    queryFn: async () => {
      if (!file || !mimeType || !mimeType.startsWith("image/")) {
        return null;
      }

      try {
        const bitmap = await createImageBitmap(file);
        let targetWidth = width;
        let targetHeight = height;

        const ratio = Math.min(width / bitmap.width, height / bitmap.height);

        if (ratio < 1) {
          targetWidth = Math.round(bitmap.width * ratio);
          targetHeight = Math.round(bitmap.height * ratio);
        } else {
          targetWidth = bitmap.width;
          targetHeight = bitmap.height;
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          bitmap.close();
          return null;
        }

        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
        bitmap.close();

        return canvas.toDataURL("image/jpeg", 0.7);
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
