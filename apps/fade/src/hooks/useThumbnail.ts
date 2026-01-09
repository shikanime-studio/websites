/// <reference types="@webgpu/types" />
import { useQuery } from "@tanstack/react-query";
import { useFile } from "./useFile";
import {
  ResizeContext,
} from "../lib/resize";
import { useResize } from "./useResize";

const thumbnailRegistry = new FinalizationRegistry((url: string) => {
  URL.revokeObjectURL(url);
});

const thumbnailCache = new WeakMap<File, Promise<string>>();

async function generateThumbnail(
  file: File,
  context: ResizeContext | null | undefined,
  size = 200,
  quality = 0.8,
): Promise<string> {

  // Return early if not an image
  if (!file.type.startsWith("image/")) {
    throw new Error("Not an image");
  }

  // Check cache first
  const cachedPromise = thumbnailCache.get(file);
  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = (async () => {
    try {
      // Create a bitmap from the source file
      const bitmap = await createImageBitmap(file);

      const width = bitmap.width;
      const height = bitmap.height;

      // Calculate new dimensions maintaining aspect ratio
      let newWidth = width;
      let newHeight = height;

      if (width > height) {
        if (width > size) {
          newWidth = size;
          newHeight = (height / width) * size;
        }
      } else {
        if (height > size) {
          newHeight = size;
          newWidth = (width / height) * size;
        }
      }

      // If the image is already small enough, just use the original file
      if (width <= size && height <= size) {
        const url = URL.createObjectURL(file);
        thumbnailRegistry.register(file, url);
        bitmap.close();
        return url;
      }

      let blob: Blob | null = null;

      // Try WebGPU first
      if (typeof OffscreenCanvas !== "undefined" && context) {
        blob = await context.run(bitmap, newWidth, newHeight, quality);
      }

      bitmap.close(); // Important to release memory

      if (!blob) throw new Error("Could not generate thumbnail blob");

      const url = URL.createObjectURL(blob);
      thumbnailRegistry.register(file, url);

      return url;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      // Fallback to original object URL if generation fails
      const url = URL.createObjectURL(file);
      thumbnailRegistry.register(file, url);
      return url;
    }
  })();

  thumbnailCache.set(file, promise);
  return promise;
}

export function useThumbnail(
  handle: FileSystemFileHandle | undefined | null,
  options: { size?: number; quality?: number } = {},
) {
  const { file } = useFile(handle, { createUrl: false });
  const { size = 200, quality = 0.8 } = options;
  const { data: context } = useResize();

  const { data: thumbnailUrl, isLoading } = useQuery({
    queryKey: ["thumbnail", handle?.name, file?.lastModified, size, quality],
    queryFn: () =>
      file
        ? generateThumbnail(file, context, size, quality)
        : Promise.resolve(null),
    enabled: !!file,
  });

  return { thumbnailUrl, isLoading };
}
