import type { FileItem } from "@shikanime-studio/fs";
import { useDirectory } from "@shikanime-studio/fs/react";
import { useFile } from "@shikanime-studio/darkroom/react";
import { useGallery } from "../hooks/useGallery";
import { useRawImage, demosaicImage, terminateImageWorker } from "@shikanime-studio/darkroom/react";
import { useThumbnail } from "../hooks/useThumbnail";
import { useExif } from "@shikanime-studio/darkroom/react";
import { usePreview } from "@shikanime-studio/darkroom/react";

export function MainViewer() {
  const { selectedFile } = useGallery();
  const { handle } = useDirectory();
  const { file: _file, mimeType: _mimeType } = useFile(selectedFile);
  const { data: raw } = useRawImage(selectedFile);
  const { data: exif } = useExif(selectedFile);
  const { url: thumbnailUrl } = useThumbnail(selectedFile);
  const { blob } = usePreview(selectedFile);

  return null;
}
