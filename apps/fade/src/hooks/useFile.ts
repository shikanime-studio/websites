import { useSuspenseQuery } from "@tanstack/react-query";
import type { FileItem } from "../lib/fs";

export function useFile(fileItem: FileItem | null) {
  const { data: file } = useSuspenseQuery({
    queryKey: ["file", fileItem?.handle.name],
    queryFn: async () => {
      if (!fileItem) return null;
      return fileItem.handle.getFile();
    },
    staleTime: Infinity,
  });

  return {
    file,
    mimeType: fileItem?.mimeType,
  };
}
