import { useEffect, useState } from "react";
import { useFile } from "../hooks/useFile";
import { useImageInfo } from "../hooks/useImageInfo";
import { useModal } from "../hooks/useModal";
import { useObjectUrl } from "../hooks/useObjectUrl";
import { FileIcon } from "./FileIcon";
import { FullscreenModal } from "./FullscreenModal";
import { FullscreenNavigation } from "./FullscreenNavigation";
import { ImageRender } from "./ImageRender";
import type { FileItem } from "../lib/fs";

interface ImageViewerProps {
  fileItem?: FileItem;
}

export function ImageViewer({ fileItem }: ImageViewerProps) {
  const { file, mimeType } = useFile(fileItem ?? null);
  const { url } = useObjectUrl(file ?? null);
  const { setImage } = useImageInfo();
  const { modal, setModal } = useModal();
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);

  if (url !== prevUrl) {
    setPrevUrl(url ?? null);
    setLoadedImage(null);
  }

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
          <img
            src={url}
            alt={fileItem?.handle.name}
            className="hidden"
            onLoad={(e) => {
              const img = e.currentTarget;
              setLoadedImage(img);
              setImage(img);
            }}
          />
          <div className="contents">
            {loadedImage ? (
              <ImageRender
                image={loadedImage}
                className="animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                onDoubleClick={() => {
                  setModal("fullscreen");
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" />
              </div>
            )}
          </div>
          <FullscreenModal
            open={modal === "fullscreen"}
            onClose={() => {
              setModal(undefined);
            }}
          >
            <FullscreenNavigation>
              {loadedImage && (
                <ImageRender
                  image={loadedImage}
                  className="max-h-full max-w-full object-contain"
                />
              )}
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
