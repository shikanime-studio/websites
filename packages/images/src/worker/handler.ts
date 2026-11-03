import type { ImageWorkerRequest } from "./protocol";
import { readExif } from "../codec/exif-read";
import { readPreview } from "../codec/preview";

/**
 * The worker's whole vocabulary, as a pure function of a request. Running this
 * in-process is the fallback when a Worker is not available (SSR, tests).
 */
export async function handleImageRequest(
  request: ImageWorkerRequest,
): Promise<unknown> {
  const source = {
    mimeType: request.input.mimeType,
    getFile: () => Promise.resolve(request.input.file),
  };
  switch (request.kind) {
    case "exif":
      return await readExif(source);
    case "preview":
      return await readPreview(source);
  }
}
