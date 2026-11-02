import type { FileItem } from "../lib/fs";
import { useAtom, useAtomSuspense } from "@effect/atom-react";
import { useCallback } from "react";
import { galleryAtom } from "../lib/photo-atoms";
import { directoryHandleAtom, selectedIndexAtom } from "../lib/ui-atoms";

export interface GalleryState {
  files: Array<FileItem>;
  selectedIndex: number;
}

export interface GalleryValue extends GalleryState {
  selectFile: (index: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  selectedFile: FileItem | null;
}

export function useGallery(): GalleryValue {
  const handle = useAtom(directoryHandleAtom)[0];
  const files = useAtomSuspense(galleryAtom(handle)).value ?? [];
  const [storedIndex, setStoredIndex] = useAtom(selectedIndexAtom);
  const selectedIndex = Math.min(storedIndex, Math.max(files.length - 1, 0));

  const selectFile = useCallback(
    (index: number) => {
      setStoredIndex(Math.max(0, Math.min(index, files.length - 1)));
    },
    [files.length, setStoredIndex],
  );

  const navigateNext = useCallback(() => {
    setStoredIndex((prev) => Math.min(prev + 1, files.length - 1));
  }, [files.length, setStoredIndex]);

  const navigatePrevious = useCallback(() => {
    setStoredIndex((prev) => Math.max(prev - 1, 0));
  }, [setStoredIndex]);

  return {
    files,
    selectedIndex,
    selectFile,
    navigateNext,
    navigatePrevious,
    selectedFile: files[selectedIndex] ?? null,
  };
}
