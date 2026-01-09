import { useQuery } from "@tanstack/react-query";
import { fileTypeFromBlob } from "file-type";
import { useMemo } from "react";

const registry = new FinalizationRegistry((url: string) => {
  URL.revokeObjectURL(url);
});

const cache = new WeakMap<File, string>();

function getObjectUrl(file: File) {
  let url = cache.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    cache.set(file, url);
    registry.register(file, url);
  }
  return url;
}

export function useFile(handle: FileSystemFileHandle | undefined | null) {
  const {
    data: fileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["file", handle?.name],
    queryFn: async () => {
      if (!handle) return null;
      const file = await handle.getFile();
      const type = await fileTypeFromBlob(file);
      return { file, mimeType: type?.mime ?? file.type };
    },
    staleTime: Infinity,
  });

  const url = useMemo(
    () => (fileData?.file ? getObjectUrl(fileData.file) : null),
    [fileData?.file],
  );

  return {
    file: fileData?.file,
    mimeType: fileData?.mimeType,
    url,
    isLoading,
    error,
  };
}
