import type { CommissionStatus } from "../schema";
import { Schema } from "effect";

export type { CommissionStatus };

const CommissionStatusSchema = Schema.Literals([
  "requested",
  "accepted",
  "scheduled",
  "completed",
  "delivered",
]);

const decodeStatus = Schema.decodeUnknownOption(CommissionStatusSchema);

export const COMMISSION_STATUSES: ReadonlyArray<CommissionStatus> = [
  "requested",
  "accepted",
  "scheduled",
  "completed",
  "delivered",
];

export const STATUS_TRANSITIONS: Readonly<
  Record<CommissionStatus, ReadonlyArray<CommissionStatus>>
> = {
  requested: ["accepted"],
  accepted: ["scheduled", "completed"],
  scheduled: ["completed"],
  completed: ["delivered"],
  delivered: [],
};

export function canTransition(
  from: CommissionStatus,
  to: CommissionStatus,
): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

export function nextStatuses(
  from: CommissionStatus,
): ReadonlyArray<CommissionStatus> {
  return STATUS_TRANSITIONS[from];
}

export function isCommissionStatus(value: string): value is CommissionStatus {
  return decodeStatus(value)._tag === "Some";
}

/**
 * Google Maps no-API embed: the q parameter carries the free-text place the
 * parties agreed on. ponytail: switch to the Embed API with a stored
 * place_id when precise pin placement matters.
 */
export function mapEmbedUrl(locationQuery: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`;
}

export function mapLinkUrl(locationQuery: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
}

const IMAGE_TYPES: ReadonlySet<string> = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function isAllowedImageType(contentType: string): boolean {
  return IMAGE_TYPES.has(contentType);
}

export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;

export function photoObjectKey(
  commissionId: number,
  photoId: number,
  contentType: string,
): string {
  const extension = contentType.split("/")[1] ?? "bin";
  return `commissions/${commissionId}/${photoId}.${extension}`;
}
