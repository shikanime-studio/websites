import { useCallback, useState } from "react";
import { DirectoryContext } from "../hooks/useDirectory";
import { useCompat } from "../hooks/useCompat";
import type { ReactNode } from "react";

export function DirectoryProvider({ children }: { children: ReactNode }) {
  const [handle, setHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const { isFileSystemAccessSupported } = useCompat();

  const select = useCallback(async () => {
    try {
      // Check if the API is supported
      if (!isFileSystemAccessSupported) {
        alert("File System Access API is not supported in this browser");
        return;
      }

      const dirHandle = await window.showDirectoryPicker();
      setHandle(dirHandle);
    } catch (error) {
      // User cancelled the picker
      if ((error as Error).name !== "AbortError") {
        console.error("Error loading directory:", error);
      }
    }
  }, [isFileSystemAccessSupported]);

  return (
    <DirectoryContext.Provider
      value={{
        handle,
        select,
      }}
    >
      {children}
    </DirectoryContext.Provider>
  );
}
