import type { FileItem } from "../lib/fs";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Spinner } from "@astryxdesign/core/Spinner";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Suspense } from "react";
import { useGallery } from "../hooks/useGallery";
import { ImageViewer } from "./ImageViewer";
import { RawImageViewer } from "./RawImageViewer";

export function MainViewer() {
  const { selectedFile, files, selectedIndex, navigateNext, navigatePrevious } =
    useGallery();

  if (files.length === 0) {
    return <EmptyMainViewer />;
  }

  const canGoPrevious = selectedIndex > 0;
  const canGoNext = selectedIndex < files.length - 1;

  return (
    <div className="bg-body relative flex min-w-0 flex-1 items-center justify-center">
      <IconButton
        className="absolute left-4 z-10"
        variant="ghost"
        label="Previous file"
        icon={<ChevronLeft className="h-8 w-8" />}
        isDisabled={!canGoPrevious}
        onClick={navigatePrevious}
      />

      <div className="flex h-full min-w-0 flex-1 items-center justify-center p-6">
        <Suspense fallback={<Spinner size="lg" />}>
          {selectedFile ? <MainViewerContent fileItem={selectedFile} /> : null}
        </Suspense>
      </div>

      <IconButton
        className="absolute right-4 z-10"
        variant="ghost"
        label="Next file"
        icon={<ChevronRight className="h-8 w-8" />}
        isDisabled={!canGoNext}
        onClick={navigateNext}
      />
    </div>
  );
}

function EmptyMainViewer() {
  return (
    <div className="bg-surface/50 relative flex min-w-0 flex-1 flex-col items-center justify-center">
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

interface MainViewerContentProps {
  fileItem: FileItem;
}

function MainViewerContent({ fileItem }: MainViewerContentProps) {
  if (fileItem?.mimeType === "image/x-fujifilm-raf") {
    return <RawImageViewer fileItem={fileItem} />;
  }

  return <ImageViewer fileItem={fileItem} />;
}
