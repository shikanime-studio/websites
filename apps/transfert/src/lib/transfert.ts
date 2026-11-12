import { z } from "zod";

/** Transfer lifetime in days. */
export const TRANSFER_TTL_DAYS = 7;

/** Hard cap per upload (bytes). Workers request bodies cap at 100 MiB. */
export const MAX_UPLOAD_SIZE = 100 * 1024 * 1024;

/** Per-user quota: sum of sizes of live transfers. */
export const USER_QUOTA_BYTES = 512 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "avif",
  "svg",
  "bmp",
  "ico",
]);

const IMAGE_MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
};

/** Extension without the dot, lowercased; empty when the name has none. */
export function fileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0 || dot === filename.length - 1) {
    return "";
  }
  return filename.slice(dot + 1).toLowerCase();
}

export function isImagePath(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(fileExtension(filename));
}

/** Content-Type for browser-renderable images; octet-stream otherwise. */
export function contentTypeFor(filename: string): string {
  return (
    IMAGE_MIME_TYPES[fileExtension(filename)] ?? "application/octet-stream"
  );
}

export const TRANSFER_ID_LENGTH = 20;

/** Transfer id: URL-safe base64url, crypto-random. */
export function newTransferId(random: () => Uint8Array): string {
  const bytes = random();
  let out = "";
  for (const byte of bytes) {
    out += byte.toString(36).padStart(2, "0");
  }
  return out.slice(0, TRANSFER_ID_LENGTH);
}

export function expiryDate(now: Date): Date {
  return new Date(now.getTime() + TRANSFER_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export interface UploadIntent {
  id: string;
  filename: string;
  size: number;
  expiresAt: string;
}

export const uploadIntentSchema = z.object({
  filename: z.string().min(1).max(255),
  size: z.number().int().positive().max(MAX_UPLOAD_SIZE),
});
