import type { ImageWorkerRequest } from "./protocol";
import { Schema } from "effect";
import { readExif } from "../codec/exif-read";
import { readPreview } from "../codec/preview";
import { ImageWorkerRequestSchema } from "./schema";

/**
 * The worker's whole vocabulary, as a pure function of a request. Running this
 * in-process is the fallback when a Worker is not available (SSR, tests).
 */
export async function handleImageRequest(
  input: unknown,
): Promise<unknown> {
  const decoded = Schema.decodeUnknownOption(ImageWorkerRequestSchema)(input);
  if (decoded._tag === "None") {
    throw new Error("Invalid image worker request");
  }
  const request = decoded.value as ImageWorkerRequest;
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
