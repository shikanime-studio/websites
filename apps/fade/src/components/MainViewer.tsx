import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
} from "lucide-react";
import { Image } from "@unpic/react";
import { useGallery } from "./GalleryContext";
import { useFile } from "../hooks/useFile";
import { FileIcon } from "./FileIcon";

export function MainViewer() {
  const { selectedFile, files, selectedIndex, navigateNext, navigatePrevious } =
    useGallery();
  const { file, url } = useFile(selectedFile?.handle);

  if (files.length === 0) {
    return (
      <div className="bg-base-200/50 relative flex min-w-0 flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 opacity-50">
          <ImageOff className="h-16 w-16 opacity-30" />
          <p className="m-0 text-base font-medium">No files loaded</p>
          <p className="m-0 text-sm opacity-70">
            Click &quot;Open Folder&quot; to select a directory
          </p>
        </div>
      </div>
    );
  }

  const canGoPrevious = selectedIndex > 0;
  const canGoNext = selectedIndex < files.length - 1;

  return (
    <div className="bg-base-100 relative flex min-w-0 flex-1 items-center justify-center">
      <button
        className="btn btn-circle btn-ghost absolute left-4 z-10 h-12 w-12"
        onClick={navigatePrevious}
        disabled={!canGoPrevious}
        aria-label="Previous file"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      <div className="flex h-full min-w-0 flex-1 items-center justify-center p-6">
        {selectedFile &&
          file &&
          url &&
          (file.type.startsWith("image/") ? (
            <Image
              key={url}
              src={url}
              alt={selectedFile.handle.name}
              className="animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl"
              layout="fullWidth"
              background="auto"
            />
          ) : (
            <object
              data={url}
              type={file.type}
              className="animate-fade-in h-full w-full rounded-lg object-contain shadow-2xl"
            >
              <div className="flex h-full flex-col items-center justify-center gap-4 opacity-50">
                <FileIcon type={file.type} className="h-32 w-32 opacity-30" />
                <p className="m-0 text-xl font-medium">
                  Preview not available for this file type
                </p>
                <p className="m-0 text-base opacity-70">
                  {selectedFile.handle.name}
                </p>
              </div>
            </object>
          ))}
      </div>

      <button
        className="btn btn-circle btn-ghost absolute right-4 z-10 h-12 w-12"
        onClick={navigateNext}
        disabled={!canGoNext}
        aria-label="Next file"
      >
        <ChevronRight className="h-8 w-8" />
      </button>
    </div>
  );
}
