import { useCallback, useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { GalleryContext } from "../hooks/useGallery";
import { scanDirectory } from "../lib/fs";
import type { ReactNode } from "react";

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [directoryHandle, setDirectoryHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [loadId, setLoadId] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: files, isFetching } = useSuspenseQuery({
    queryKey: ["gallery", loadId],
    queryFn: async () => {
      if (!directoryHandle) return [];
      return scanDirectory(directoryHandle);
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const loadDirectory = useCallback(async () => {
    try {
      // Check if the API is supported
      if (!("showDirectoryPicker" in window)) {
        alert("File System Access API is not supported in this browser");
        return;
      }

      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
      setLoadId((id) => id + 1);
      setSelectedIndex(0);
    } catch (error) {
      // User cancelled the picker
      if ((error as Error).name !== "AbortError") {
        console.error("Error loading directory:", error);
      }
    }
  }, []);

  const selectFile = useCallback(
    (index: number) => {
      setSelectedIndex(Math.max(0, Math.min(index, files.length - 1)));
    },
    [files.length],
  );

  const navigateNext = useCallback(() => {
    setSelectedIndex((prev) => Math.min(prev + 1, files.length - 1));
  }, [files.length]);

  const navigatePrevious = useCallback(() => {
    setSelectedIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (files.length === 0) return;

      switch (event.key) {
        case "ArrowRight":
          navigateNext();
          event.preventDefault();
          break;
        case "ArrowLeft":
          navigatePrevious();
          event.preventDefault();
          break;
        case "Home":
          selectFile(0);
          event.preventDefault();
          break;
        case "End":
          selectFile(files.length - 1);
          event.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [files.length, navigateNext, navigatePrevious, selectFile]);

  const selectedFile = files.length > 0 ? files[selectedIndex] : null;

  return (
    <GalleryContext.Provider
      value={{
        files,
        selectedIndex,
        isLoading: isFetching,
        loadDirectory,
        selectFile,
        navigateNext,
        navigatePrevious,
        selectedFile,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
}
