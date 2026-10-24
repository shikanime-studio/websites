import type { ReactNode } from "react";
import { useAtomSuspense } from "@effect/atom-react";
import { useCallback, useState } from "react";
import { GalleryContext } from "../hooks/useGallery";
import { useKeymap } from "../hooks/useKeymap";
import { galleryAtom } from "../lib/photo-atoms";

export function GalleryProvider({
  children,
  handle,
}: {
  children: ReactNode;
  handle: FileSystemDirectoryHandle | null;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const files = useAtomSuspense(galleryAtom(handle)).value ?? [];

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

  useKeymap("navigateNext", () => {
    if (files.length === 0) return;
    navigateNext();
  });

  useKeymap("navigatePrevious", () => {
    if (files.length === 0) return;
    navigatePrevious();
  });

  useKeymap("selectFirst", () => {
    if (files.length === 0) return;
    selectFile(0);
  });

  useKeymap("selectLast", () => {
    if (files.length === 0) return;
    selectFile(files.length - 1);
  });

  const selectedFile = files[selectedIndex] ?? null;

  return (
    <GalleryContext
      value={{
        files,
        selectedIndex,
        selectFile,
        navigateNext,
        navigatePrevious,
        selectedFile,
      }}
    >
      {children}
    </GalleryContext>
  );
}
