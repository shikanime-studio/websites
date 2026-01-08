import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

export interface ImageItem {
  file: File;
  url: string;
  name: string;
  size: number;
}

interface GalleryState {
  images: Array<ImageItem>;
  selectedIndex: number;
  isLoading: boolean;
}

interface GalleryContextValue extends GalleryState {
  loadDirectory: () => Promise<void>;
  selectImage: (index: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  selectedImage: ImageItem | null;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GalleryState>({
    images: [],
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
      const imageItems: Array<ImageItem> = [];

      for await (const entry of directoryHandle.values()) {
        if (entry.kind === "file") {
          const lowerName = entry.name.toLowerCase();
          const isImage = IMAGE_EXTENSIONS.some((ext) =>
            lowerName.endsWith(ext),
          );

          if (isImage) {
            const file = await entry.getFile();
            const url = URL.createObjectURL(file);
            imageItems.push({
              file,
              url,
              name: entry.name,
              size: file.size,
            });
          }
        }
      }

      // Sort by filename
      imageItems.sort((a, b) => a.name.localeCompare(b.name));

      setState({
        images: imageItems,
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

  const selectImage = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      selectedIndex: Math.max(0, Math.min(index, prev.images.length - 1)),
    }));
  }, []);

  const navigateNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedIndex: Math.min(prev.selectedIndex + 1, prev.images.length - 1),
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
      if (state.images.length === 0) return;

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
          selectImage(0);
          event.preventDefault();
          break;
        case "End":
          selectImage(state.images.length - 1);
          event.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.images.length, navigateNext, navigatePrevious, selectImage]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      state.images.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, [state.images]);

  const selectedImage =
    state.images.length > 0 ? state.images[state.selectedIndex] : null;

  return (
    <GalleryContext.Provider
      value={{
        ...state,
        loadDirectory,
        selectImage,
        navigateNext,
        navigatePrevious,
        selectedImage,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGallery() {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
}
