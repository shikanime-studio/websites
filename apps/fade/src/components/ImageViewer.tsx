import { Image } from "@unpic/react";
import { useEffect, useRef } from "react";
import { useFile } from "../hooks/useFile";
import { useImageInfo } from "../hooks/useImageInfo";
import { useModal } from "../hooks/useModal";
import { useObjectUrl } from "../hooks/useObjectUrl";
import { FileIcon } from "./FileIcon";
import { FullscreenModal } from "./FullscreenModal";
import { FullscreenNavigation } from "./FullscreenNavigation";
import type { FileItem } from "../lib/fs";

interface ImageViewerProps {
  fileItem?: FileItem;
}

export function ImageViewer({ fileItem }: ImageViewerProps) {
  const { file, mimeType } = useFile(fileItem ?? null);
  const { url } = useObjectUrl(file ?? null);
  const { setImage } = useImageInfo();
  const imgRef = useRef<HTMLImageElement>(null);
  const { modal, setModal } = useModal();

  useEffect(() => {
    if (!file || !url || !mimeType?.startsWith("image/")) {
      setImage(null);
    }
  }, [file, url, mimeType, setImage]);

  if (!file || !url) return null;

  return (
    <>
      {mimeType?.startsWith("image/") ? (
        <>
          <Image
            ref={imgRef}
            key={url}
            src={url}
            alt={fileItem?.handle.name ?? ""}
            className="animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            layout="fullWidth"
            background="auto"
            onLoad={(e) => {
              setImage(e.currentTarget as HTMLImageElement);
            }}
            onDoubleClick={() => {
              setModal("fullscreen");
            }}
          />
          <FullscreenModal
            open={modal === "fullscreen"}
            onClose={() => {
              setModal(undefined);
            }}
          >
            <FullscreenNavigation>
              <Image
                src={url}
                alt={fileItem?.handle.name ?? ""}
                className="max-h-full max-w-full object-contain"
                layout="fullWidth"
                background="auto"
              />
            </FullscreenNavigation>
          </FullscreenModal>
        </>
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
