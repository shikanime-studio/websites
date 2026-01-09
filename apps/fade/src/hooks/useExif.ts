import { useSuspenseQuery } from "@tanstack/react-query";
import { getExifTags } from "../lib/exif";

export function useExif(file: File | null) {
  const { data } = useSuspenseQuery({
    queryKey: ["exif", file?.name, file?.lastModified, file?.size],
    queryFn: async () => {
      if (!file) return null;

      try {
        return await getExifTags(file);
      } catch (err) {
        console.error("Failed to parse EXIF:", err);
        return null;
      }
    },
    staleTime: Infinity,
  });

  return data;
}
