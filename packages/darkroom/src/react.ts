import { useSuspenseQuery } from "@tanstack/react-query";
import { getFileSystem } from "@shikanime-studio/fs";
import type { FileItem } from "@shikanime-studio/fs";
import { createImageWorkerClient } from "./worker-client";
import { extractJpegFromRaf } from "./parsers/raf";
import type { ExifTagEntry } from "./parsers/exif";

let workerClient: ReturnType<typeof createImageWorkerClient> | null = null;

function getWorkerClient() {
  if (!workerClient) {
    workerClient = createImageWorkerClient();
  }
  return workerClient;
}

export function useFile(fileItem: FileItem | null) {
  const { data: file } = useSuspenseQuery({
    queryKey: ["file", fileItem?.name],
    queryFn: async () => {
      if (!fileItem) return null;
      const fs = getFileSystem();
      const { data } = await fs.readFile(fileItem);
      return new File([data], fileItem.name);
    },
    staleTime: Infinity,
  });

  return {
    file,
    mimeType: fileItem?.mimeType,
  };
}

export function usePreview(fileItem: FileItem | null) {
  const { file, mimeType } = useFile(fileItem);

  const { data: blob } = useSuspenseQuery({
    queryKey: ["preview", file?.name, file?.lastModified],
    queryFn: async () => {
      if (!file) return null;

      if (mimeType === "image/x-fujifilm-raf") {
        const buffer = await file.arrayBuffer();
        const jpegBytes = extractJpegFromRaf(buffer);
        if (!jpegBytes) return null;
        return new Blob([jpegBytes as unknown as BlobPart], {
          type: "image/jpeg",
        });
      }

      return file;
    },
    staleTime: Infinity,
  });

  return { blob, mimeType };
}

export function useExif(fileItem: FileItem | null) {
  const { data } = useSuspenseQuery({
    queryKey: ["exif", fileItem?.name],
    queryFn: async (): Promise<Array<ExifTagEntry> | null> => {
      if (!fileItem) return null;

      const client = getWorkerClient();
      await client.init();

      const fs = getFileSystem();
      const { data: buffer } = await fs.readFile(fileItem);
      const mimeType = fileItem.mimeType ?? "application/octet-stream";

      try {
        return await client.getExif(buffer, mimeType);
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
  });

  return data;
}

export function useRawImage(fileItem: FileItem | null) {
  return useSuspenseQuery({
    queryKey: ["raw-image", fileItem?.name],
    queryFn: async () => {
      if (!fileItem) return null;

      const client = getWorkerClient();
      await client.init();

      const fs = getFileSystem();
      const { data, name } = await fs.readFile(fileItem);
      const mimeType = fileItem.mimeType ?? "application/octet-stream";

      const frame = await client.parseRaw(data, mimeType);

      return {
        width: frame.width,
        height: frame.height,
        bitDepth: frame.bitDepth,
        cfa: frame.cfa,
        make: frame.make,
        name,
      };
    },
    staleTime: Infinity,
  });
}

export function demosaicImage(
  fileItem: FileItem,
): Promise<{ width: number; height: number; pixels: Uint8ClampedArray } | null> {
  const client = getWorkerClient();
  return client.init().then(() => {
    const fs = getFileSystem();
    return fs.readFile(fileItem).then(({ data }) => {
      const mimeType = fileItem.mimeType ?? "application/octet-stream";
      return client.demosaic(data, mimeType).catch(() => null);
    });
  });
}

export function terminateImageWorker() {
  if (workerClient) {
    workerClient.terminate();
    workerClient = null;
  }
}
