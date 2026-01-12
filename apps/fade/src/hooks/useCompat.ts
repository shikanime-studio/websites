import { useMemo } from "react";

export function useCompat() {
  const isFileSystemAccessSupported = useMemo(() => {
    return typeof window !== "undefined" && "showDirectoryPicker" in window;
  }, []);

  return {
    isFileSystemAccessSupported,
  };
}
