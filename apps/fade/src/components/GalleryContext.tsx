import { useCallback, useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { GalleryContext } from "../hooks/useGallery";
import { scanDirectory } from "../lib/fs";
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
    queryKey: ["gallery", handle],
    queryFn: async () => {
      if (!handle) return [];
      return scanDirectory(handle);
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // Reset selection when directory changes
  useEffect(() => {
    // We can't synchronously update state in effect, but we can do it when the handle changes
    // However, since 'files' is derived from 'handle' via suspense query,
    // a change in handle triggers a new query and 'files' updates.
    // We want to reset index when the directory (handle) changes.
    // The previous implementation was setting state in effect which causes cascading updates.
    // Instead of effect, we can key the provider or just accept that
    // when handle changes, we might want to reset.
    // A better pattern for "reset state on prop change" is using a key on the component
    // or doing it in the parent.
    // But given the constraints, let's keep it simple:
    // If we must reset, we can do it in a way that doesn't trigger the lint error
    // OR just ignore it if we're sure it's what we want (it is a cascading update).
    //
    // However, the best React way is to derive state or key the component.
    // Since we can't easily key the whole provider without unmounting children state,
    // we can use the 'key' prop on the returned Provider to force reset if needed,
    // but that resets everything.
    //
    // Let's try to ignore the lint rule for now as it is a specific behavior we want
    // (reset index when handle changes), OR use a ref to track prev handle.
  }, [handle]);

  // Actually, to fix "setState in effect", we should usually derive state during render
  // or use a key.
  // Let's use the key approach on the internal state holder or similar.
  // For now, let's just suppress the warning if we can't refactor the whole architecture,
  // BUT the lint error is explicit.

  // Refactoring to use 'key' to reset state:
  // We can wrap the inner logic in a component that takes 'handle' as a key?
  // No, that would remount children.

  // Let's just fix it by tracking the handle in a ref and resetting if it changes during render?
  // No, that's "derived state from props".
  const [prevHandle, setPrevHandle] = useState(handle);
  if (handle !== prevHandle) {
    setPrevHandle(handle);
    setSelectedIndex(0);
  }

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
