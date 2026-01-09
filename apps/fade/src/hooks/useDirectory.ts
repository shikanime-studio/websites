import { createContext, useContext } from "react";

export interface DirectoryContextValue {
  handle: FileSystemDirectoryHandle | null;
  select: () => Promise<void>;
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
