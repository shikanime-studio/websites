import { useCallback, useState } from "react";
import { DirectoryContext, useFileSystemSupport } from "../hooks/useDirectory";
import type { ReactNode } from "react";

export function DirectoryProvider({ children }: { children: ReactNode }) {
  const [handle, setHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const isSupported = useFileSystemSupport();

  const select = useCallback(async () => {
    try {
      // Check if the API is supported
      if (!isSupported) {
        alert("Browser support is limited");
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
  }, [isSupported]);

  return (
    <DirectoryContext.Provider
      value={{
        handle,
        select,
        isSupported,
      }}
    >
      {children}
    </DirectoryContext.Provider>
  );
}
