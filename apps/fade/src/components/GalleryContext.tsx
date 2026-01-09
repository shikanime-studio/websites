import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

export interface FileItem {
  handle: FileSystemFileHandle;
}

interface GalleryState {
  files: Array<FileItem>;
  selectedIndex: number;
  isLoading: boolean;
}

interface GalleryContextValue extends GalleryState {
  loadDirectory: () => Promise<void>;
  selectFile: (index: number) => void;
  navigateNext: () => void;
  navigatePrevious: () => void;
  selectedFile: FileItem | null;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

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
      const items: Array<FileItem> = [];

      for await (const handle of directoryHandle.values()) {
        if (handle.kind === "file") {
          items.push({ handle });
        }
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
    return () => window.removeEventListener("keydown", handleKeyDown);
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

// eslint-disable-next-line react-refresh/only-export-components
export function useGallery() {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
}
