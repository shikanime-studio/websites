import { scanDirectoryFromHandle } from "@shikanime-studio/fs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { GalleryContext } from "../hooks/useGallery";
import type { ReactNode } from "react";

export function GalleryProvider({
  children,
  handle,
}: {
  children: ReactNode;
  handle: FileSystemDirectoryHandle | null;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: files } = useSuspenseQuery({
    queryKey: ["gallery", handle?.name],
    queryFn: async () => {
      if (!handle) return [];
      return scanDirectoryFromHandle(handle);
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const selectFile = useCallback(
    (index: number) => {
      if (!files || index < 0) return;
      setSelectedIndex(Math.min(index, files.length - 1));
    },
    [files],
  );

  const navigateNext = useCallback(() => {
    if (!files) return;
    setSelectedIndex((prev) => Math.min(prev + 1, files.length - 1));
  }, [files]);

  const navigatePrevious = useCallback(() => {
    setSelectedIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!files || files.length === 0) return;

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
  }, [files, navigateNext, navigatePrevious, selectFile]);

  const selectedFile = files && files.length > 0 ? files[selectedIndex] : null;

  return (
    <GalleryContext.Provider
      value={{
        files: files ?? [],
        selectedIndex,
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
