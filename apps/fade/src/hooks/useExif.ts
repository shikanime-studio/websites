import { eq, useLiveQuery } from "@tanstack/react-db";
import { useQuery } from "@tanstack/react-query";
import { vfsCollection } from "../lib/db";
import { getExifTags } from "../lib/exif";
import type { ExifTags } from "../lib/exif";

export function useExif(file: File | undefined | null, path?: string) {
  const filePath = path ?? (file ? `/${file.name}` : "");

  const { data: vfsData } = useLiveQuery((q) =>
    q.from({ vfs: vfsCollection }).where(({ vfs }) => eq(vfs.id, filePath)),
  );

  const cachedFile = vfsData[0];
  const isCached =
    cachedFile &&
    cachedFile.lastModified === file?.lastModified &&
    cachedFile.metadata?.exif;

  return useQuery({
    queryKey: ["exif", filePath, file?.lastModified],
    queryFn: async () => {
      if (!file) return null;
      if (isCached) return cachedFile.metadata?.exif as ExifTags;

      try {
        const tags = await getExifTags(file);

        // Update DB
        if (cachedFile) {
          vfsCollection.update(filePath, (draft) => {
            draft.metadata = { ...draft.metadata, exif: tags };
            draft.lastModified = file.lastModified;
            draft.size = file.size;
            draft.type = file.type;
            draft.path = filePath;
          });
        } else {
          vfsCollection.insert({
            id: filePath,
            name: file.name,
            path: filePath,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            metadata: { exif: tags as unknown as Record<string, unknown> },
          });
        }

        return tags;
      } catch (err) {
        console.error("Failed to parse EXIF:", err);
        return null;
      }
    },
    enabled: !!file,
    initialData: isCached ? (cachedFile.metadata?.exif as ExifTags) : undefined,
    staleTime: Infinity,
  });
}
