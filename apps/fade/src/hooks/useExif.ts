import type { ExifDataView, ExifTagEntry } from "../lib/exif";
import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { useMemo } from "react";
import { nullableAtom } from "../lib/atoms";
import { createImageDataView } from "../lib/img";
import { RafDataView } from "../lib/raf";

export function useExif(fileItem: FileItem | null) {
  const atom = useMemo(
    () =>
      nullableAtom<ExifTagEntry[]>(fileItem, "exif", async () => {
        if (!fileItem) return null;

        try {
          const view = await createImageDataView(fileItem);
          if (!view) return null;

          let exifView: ExifDataView<ArrayBufferLike> | null = null;
          if (view instanceof RafDataView) {
            const jpeg = view.getJpegImage();
            if (jpeg) {
              exifView = jpeg.getExif();
            }
          } else {
            exifView = view.getExif();
          }

          return exifView ? exifView.getTagEntries() : null;
        } catch (error) {
          console.error(
            "Failed to read the camera data (EXIF) for this image.",
            error,
          );
          return null;
        }
      }),
    [fileItem],
  );

  return useAtomSuspense(atom).value;
}
