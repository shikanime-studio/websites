import { useCallback, useEffect, useState } from "react";
import { GalleryContext } from "../hooks/useGallery";
import type { ReactNode } from "react";
import type { FileItem, GalleryState } from "../hooks/useGallery";

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GalleryState>({
    files: [],
    selectedIndex: 0,
    isLoading: false,
  });

  const loadDirectory = useCallback(async () => {
    try {
      // Check if the API is supported
      if (!("showDirectoryPicker" in window)) {
        alert("File System Access API is not supported in this browser");
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      const directoryHandle = await window.showDirectoryPicker();
      const groups = new Map<string, Array<FileSystemFileHandle>>();

      for await (const handle of directoryHandle.values()) {
        if (handle.kind === "file") {
          const name = handle.name;
          const lastDotIndex = name.lastIndexOf(".");
          const basename =
            lastDotIndex === -1 ? name : name.substring(0, lastDotIndex);

          let group = groups.get(basename);
          if (!group) {
            group = [];
            groups.set(basename, group);
          }
          group.push(handle);
        }
      }

      const items: Array<FileItem> = [];
      const RASTER_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

      for (const handles of groups.values()) {
        let primaryHandle = handles[0];
        let bestScore = -1;

        for (const handle of handles) {
          const ext = handle.name.split(".").pop()?.toLowerCase() ?? "";
          const score = RASTER_EXTENSIONS.has(ext) ? 2 : 1;

          if (score > bestScore) {
            bestScore = score;
            primaryHandle = handle;
          }
        }

        const sidecars = handles.filter((h) => h !== primaryHandle);
        sidecars.sort((a, b) => a.name.localeCompare(b.name));

        items.push({
          handle: primaryHandle,
          sidecars,
        });
      }

      // Sort by filename
      items.sort((a, b) => a.handle.name.localeCompare(b.handle.name));

      setState({
        files: items,
        selectedIndex: 0,
        isLoading: false,
      });
    } catch (error) {
      // User cancelled the picker
      if ((error as Error).name !== "AbortError") {
        console.error("Error loading directory:", error);
      }
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const selectFile = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      selectedIndex: Math.max(0, Math.min(index, prev.files.length - 1)),
    }));
  }, []);

  const navigateNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIndex: Math.min(prev.selectedIndex + 1, prev.files.length - 1),
    }));
  }, []);

  const navigatePrevious = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIndex: Math.max(prev.selectedIndex - 1, 0),
    }));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (state.files.length === 0) return;

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
          selectFile(state.files.length - 1);
          event.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.files.length, navigateNext, navigatePrevious, selectFile]);

  const selectedFile =
    state.files.length > 0 ? state.files[state.selectedIndex] : null;

  return (
    <GalleryContext.Provider
      value={{
        ...state,
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
