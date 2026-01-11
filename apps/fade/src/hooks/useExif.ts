import { useSuspenseQuery } from "@tanstack/react-query";
import { getExifTags } from "../lib/exif";
import type { FileItem } from "../lib/fs";

export function useExif(fileItem: FileItem | null) {
  const { data } = useSuspenseQuery({
    queryKey: ["exif", fileItem?.handle.name],
    queryFn: async () => {
      if (!fileItem) return null;

      try {
        return await getExifTags(fileItem);
      } catch (err) {
        console.error("Failed to parse EXIF:", err);
        return null;
      }
    },
    staleTime: Infinity,
  });

  return data;
}
