import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

export function useFile(handle: FileSystemFileHandle | undefined | null) {
  const {
    data: file,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["file", handle?.name],
    queryFn: () => (handle ? handle.getFile() : Promise.resolve(null)),
    enabled: !!handle,
    staleTime: Infinity,
  });

  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return { file, url, isLoading, error };
}
