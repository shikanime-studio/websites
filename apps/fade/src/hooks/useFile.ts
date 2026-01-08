import { useQuery } from "@tanstack/react-query";
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
    data: file,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["file", handle?.name],
    queryFn: () => (handle ? handle.getFile() : Promise.resolve(null)),
    staleTime: Infinity,
  });

  const url = useMemo(() => (file ? getObjectUrl(file) : null), [file]);

  return { file, url, isLoading, error };
}
