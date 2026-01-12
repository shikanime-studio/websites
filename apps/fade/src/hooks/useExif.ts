import { useSuspenseQuery } from "@tanstack/react-query";
import { createImageDataView } from "../lib/img";
import type { ExifTagEntry } from "../lib/exif";
import type { FileItem } from "../lib/fs";

export function useExif(fileItem: FileItem | null) {
  const { data } = useSuspenseQuery({
    queryKey: ["exif", fileItem?.handle.name],
    queryFn: async (): Promise<Array<ExifTagEntry> | null> => {
      if (!fileItem) return null;

      try {
        const view = await createImageDataView(fileItem);
        const exifView = view?.getExif(0);
        return exifView ? exifView.getTagEntries(0) : null;
      } catch (err) {
        console.error("Failed to parse EXIF:", err);
        return null;
      }
    },
    staleTime: Infinity,
  });

  return data;
}
