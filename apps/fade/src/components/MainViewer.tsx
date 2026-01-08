import { useGallery } from "./GalleryContext";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

export function MainViewer() {
  const {
    selectedImage,
    images,
    selectedIndex,
    navigateNext,
    navigatePrevious,
  } = useGallery();

  if (images.length === 0) {
    return (
      <div className="bg-base-200/50 relative flex min-w-0 flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 opacity-50">
          <ImageOff className="h-16 w-16 opacity-30" />
          <p className="m-0 text-base font-medium">No images loaded</p>
          <p className="m-0 text-sm opacity-70">
            Click &quot;Open Folder&quot; to select a directory with images
          </p>
        </div>
      </div>
    );
  }

  const canGoPrevious = selectedIndex > 0;
  const canGoNext = selectedIndex < images.length - 1;

  return (
    <div className="bg-base-100 relative flex min-w-0 flex-1 items-center justify-center">
      <button
        className="btn btn-circle btn-ghost absolute left-4 z-10 h-12 w-12"
        onClick={navigatePrevious}
        disabled={!canGoPrevious}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      <div className="flex h-full min-w-0 flex-1 items-center justify-center p-6">
        {selectedImage && (
          <img
            key={selectedImage.url}
            src={selectedImage.url}
            alt={selectedImage.name}
            className="animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}
      </div>

      <button
        className="btn btn-circle btn-ghost absolute right-4 z-10 h-12 w-12"
        onClick={navigateNext}
        disabled={!canGoNext}
        aria-label="Next image"
      >
        <ChevronRight className="h-8 w-8" />
      </button>
    </div>
  );
}
