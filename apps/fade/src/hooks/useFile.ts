import { useSuspenseQuery } from "@tanstack/react-query";
import { fileTypeFromBlob } from "file-type";

export function useFile(handle: FileSystemFileHandle | null) {
  const { data: fileData } = useSuspenseQuery({
    queryKey: ["file", handle?.name],
    queryFn: async () => {
      if (!handle) return null;
      const file = await handle.getFile();
      const type = await fileTypeFromBlob(file);
      return { file, mimeType: type?.mime ?? file.type };
    },
    staleTime: Infinity,
  });

  return {
    file: fileData?.file,
    mimeType: fileData?.mimeType,
  };
}
