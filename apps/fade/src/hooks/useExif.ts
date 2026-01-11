import { useSuspenseQuery } from "@tanstack/react-query";
import { getTagEntries } from "../lib/exif";
import type { ExifTagEntry } from "../lib/exif";
import type { FileItem } from "../lib/fs";

export function useExif(fileItem: FileItem | null) {
  const { data } = useSuspenseQuery({
    queryKey: ["exif", fileItem?.handle.name],
    queryFn: async (): Promise<Array<ExifTagEntry> | null> => {
      if (!fileItem) return null;

      try {
        return await getTagEntries(fileItem);
      } catch (err) {
        console.error("Failed to parse EXIF:", err);
        return null;
      }
    },
    staleTime: Infinity,
  });

  return data;
}
