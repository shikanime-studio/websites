import { z } from "zod";

/** Transfer lifetime in days. */
export const TRANSFER_TTL_DAYS = 7;

/** Hard cap per upload (bytes). */
export const MAX_UPLOAD_SIZE = 1024 * 1024 * 1024;

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
