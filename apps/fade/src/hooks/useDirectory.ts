import { createContext, useContext, useMemo } from "react";

export function useFileSystemSupport() {
  return useMemo(() => {
    return typeof window !== "undefined" && "showDirectoryPicker" in window;
  }, []);
}

export interface DirectoryContextValue {
  handle: FileSystemDirectoryHandle | null;
  select: () => Promise<void>;
  isSupported: boolean;
}

export const DirectoryContext = createContext<DirectoryContextValue | null>(
  null,
);

export function useDirectory() {
  const context = useContext(DirectoryContext);
  if (!context) {
    throw new Error("useDirectory must be used within a DirectoryProvider");
  }
  return context;
}
