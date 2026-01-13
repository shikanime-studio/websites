import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Image } from "@unpic/react";
import { Suspense, useEffect, useRef } from "react";
import { useFile } from "../hooks/useFile";
import { useObjectUrl } from "../hooks/useObjectUrl";
import { useGallery } from "../hooks/useGallery";
import { useCanvasInfo } from "../hooks/useCanvasInfo";
import { FileIcon } from "./FileIcon";
import { RawImage } from "./RawImage";
import type { FileItem } from "../lib/fs";

export function MainViewer() {
  const { selectedFile, files, selectedIndex, navigateNext, navigatePrevious } =
    useGallery();

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
        <Suspense
          fallback={
            <span className="loading loading-spinner loading-lg"></span>
          }
        >
          {selectedFile ? <MainViewerContent fileItem={selectedFile} /> : null}
        </Suspense>
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

function MainViewerContent({ fileItem }: { fileItem: FileItem }) {
  const { handle } = fileItem;
  const { file, mimeType } = useFile(fileItem);
  const { url } = useObjectUrl(file ?? null);
  const { setImage, exposure } = useCanvasInfo();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!file || !url || !mimeType?.startsWith("image/")) {
      setImage(null);
    }
  }, [file, url, mimeType, setImage]);

  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.style.filter = `brightness(${Math.pow(2, exposure).toString()})`;
    }
  }, [exposure]);

  if (mimeType === "image/x-fujifilm-raf") {
    return <RawImage fileItem={fileItem} exposure={exposure} />;
  }

  if (!file || !url) return null;

  return (
    <>
      {mimeType?.startsWith("image/") ? (
        <Image
          ref={imgRef}
          key={url}
          src={url}
          alt={handle.name}
          className="animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-all duration-200"
          layout="fullWidth"
          background="auto"
          onLoad={(e) => {
            setImage(e.currentTarget as HTMLImageElement);
          }}
        />
      ) : mimeType?.startsWith("video/") ? (
        <video
          key={url}
          src={url}
          className="animate-fade-in max-h-full max-w-full rounded-lg shadow-2xl"
          controls
          autoPlay
          loop
        />
      ) : (
        <object
          data={url}
          type={mimeType}
          className="animate-fade-in h-full w-full rounded-lg object-contain shadow-2xl"
        >
          <div className="flex h-full flex-col items-center justify-center gap-4 opacity-50">
            <FileIcon type={mimeType} className="h-32 w-32 opacity-30" />
            <p className="m-0 text-xl font-medium">
              Preview not available for this file type
            </p>
          </div>
        </object>
      )}
    </>
  );
}
