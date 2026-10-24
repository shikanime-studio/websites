import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { useMemo } from "react";
import { nullableAtom } from "../lib/atoms";
import { RafDataView } from "../lib/raf";
import { useFile } from "./useFile";

export function usePreview(fileItem: FileItem | null) {
  const { file } = useFile(fileItem);

  const atom = useMemo(
    () =>
      nullableAtom(file, "preview", async () => {
        if (!file) return null;

        if (fileItem?.mimeType === "image/x-fujifilm-raf") {
          const buffer = await file.arrayBuffer();
          const view = new RafDataView(buffer);
          const jpgView = view.getJpegImage();
          if (!jpgView) return null;
          return new Blob([jpgView as unknown as BlobPart], {
            type: "image/jpeg",
          });
        }

        return file;
      }),
    [file, fileItem?.mimeType],
  );
  const blob = useAtomSuspense(atom).value;

  return { blob };
}
