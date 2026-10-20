import type { CommissionStatus } from "../schema";

export type { CommissionStatus };

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
  return (COMMISSION_STATUSES as ReadonlyArray<string>).includes(value);
}

export const STATUS_LABELS: Readonly<Record<CommissionStatus, string>> = {
  requested: "Requested",
  accepted: "Accepted",
  scheduled: "Scheduled",
  completed: "Shoot completed",
  delivered: "Photos delivered",
};

export const STATUS_BADGE_CLASSES: Readonly<Record<CommissionStatus, string>> =
  {
    requested: "badge-neutral",
    accepted: "badge-info",
    scheduled: "badge-warning",
    completed: "badge-accent",
    delivered: "badge-success",
  };

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

/**
 * Google Calendar render URL: a template link is plain HTML, no SDK and no
 * OAuth. Dates are UTC (YYYYMMDDTHHMMSSZ); an all-day range is used when
 * only the date is known. chrono is the canonical local time of the shoot.
 */
export function calendarEventUrl(event: {
  title: string;
  shootingDate: string;
  locationName: string;
  details: string;
}): string {
  const { start, end } = calendarRange(event.shootingDate);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    location: event.locationName,
    details: event.details,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/**
 * Accepts "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" (local shoot time) and returns
 * Google Calendar UTC stamps. A missing time means an all-day slot, rendered
 * as the whole day in the venue timezone-free form Google expects.
 */
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function calendarRange(shootingDate: string): {
  start: string;
  end: string;
} {
  const dateOnly = DATE_ONLY_PATTERN.exec(shootingDate);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return { start: `${y}${m}${d}`, end: `${y}${m}${Number(d) + 1}` };
  }
  const parsed = new Date(shootingDate);
  if (Number.isNaN(parsed.getTime())) {
    return { start: shootingDate, end: shootingDate };
  }
  const end = new Date(parsed.getTime() + 60 * 60 * 1000);
  return { start: toUtcStamp(parsed), end: toUtcStamp(end) };
}

function toUtcStamp(date: Date): string {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate(),
  )}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
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
