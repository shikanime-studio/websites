import type { CommissionStatus } from "../schema";

/** A person invited to a shoot. The email is the identity; the name is paint. */
export interface Invitee {
  name: string;
  email: string;
}

const EMAIL_PATTERN = /^[^@\s]+@[^@\s.]+(?:\.[^@\s.]+)+$/;
const INVITE_SPLIT_PATTERN = /[\n,;]+/;
const SHOOTING_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/;
const DASH_COLON = /[-:]/g;
const MILLIS = /\.\d{3}Z$/;
const DASHES = /-/g;
const ICS_BACKSLASH = /\\/g;
const ICS_NEWLINE = /\r?\n/g;
const ICS_COMMA = /,/g;
const ICS_SEMICOLON = /;/g;

export function createShareToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Accepts "Name <email>", a bare email, and comma or newline separated lists.
 * Returns the valid invitees plus the entries a person still has to fix.
 */
export function parseInviteeInput(raw: string): {
  invitees: Invitee[];
  invalid: string[];
} {
  const parts = raw
    .split(INVITE_SPLIT_PATTERN)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const invitees: Invitee[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const open = part.lastIndexOf("<");
    const named = open >= 0 && part.endsWith(">");
    const name = named ? part.slice(0, open).trim() : "";
    const email = (named ? part.slice(open + 1, -1) : part)
      .trim()
      .toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      invalid.push(part);
      continue;
    }
    if (seen.has(email)) {
      continue;
    }
    seen.add(email);
    invitees.push({ name, email });
  }
  return { invitees, invalid };
}

export function parseInvitees(json: string): Invitee[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.flatMap((item) => {
      if (typeof item !== "object" || item === null) {
        return [];
      }
      const { email, name } = item as { email?: unknown; name?: unknown };
      if (typeof email !== "string") {
        return [];
      }
      return [{ name: typeof name === "string" ? name : "", email }];
    });
  } catch {
    return [];
  }
}

export function serializeInvitees(invitees: Invitee[]): string {
  return JSON.stringify(invitees);
}

/** Offset in milliseconds of `timeZone` at the given instant. */
function timeZoneOffset(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value ?? "0";
    return Number(value);
  };
  const asUtc = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    read("hour") % 24,
    read("minute"),
    read("second"),
  );
  return asUtc - date.getTime();
}

/**
 * Interprets "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" as wall time in `timeZone`
 * and returns the matching instant. A date without a time means 09:00 there,
 * which is early enough to be a placeholder and late enough not to be midnight.
 */
export function shootingInstant(
  shootingDate: string,
  timeZone: string,
): Date | null {
  const match = SHOOTING_PATTERN.exec(shootingDate);
  if (!match) {
    return null;
  }
  const [, year, month, day, hour, minute] = match;
  const guess = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    hour === undefined ? 9 : Number(hour),
    minute === undefined ? 0 : Number(minute),
  );
  const offset = timeZoneOffset(new Date(guess), timeZone);
  return new Date(guess - offset);
}

export function formatShootingDate(
  shootingDate: string | null,
  timeZone: string,
): string {
  if (!shootingDate) {
    return "Date to be confirmed";
  }
  const instant = shootingInstant(shootingDate, timeZone);
  if (!instant) {
    return shootingDate;
  }
  const dateOnly = !shootingDate.includes("T");
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(dateOnly ? {} : { hour: "2-digit", minute: "2-digit" }),
  }).format(instant);
}

function utcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(DASH_COLON, "")
    .replace(MILLIS, "Z");
}

function dateStamp(date: Date): string {
  return date.toISOString().slice(0, 10).replace(DASHES, "");
}

export interface CalendarInput {
  title: string;
  details: string;
  location: string;
  shootingDate: string;
  timeZone: string;
  invitees: Invitee[];
  url: string;
}

function calendarRange(input: CalendarInput): {
  start: string;
  end: string;
  allDay: boolean;
} {
  const instant = shootingInstant(input.shootingDate, input.timeZone);
  if (!instant) {
    return { start: "", end: "", allDay: false };
  }
  if (!input.shootingDate.includes("T")) {
    const next = new Date(instant.getTime() + 24 * 60 * 60 * 1000);
    return { start: dateStamp(instant), end: dateStamp(next), allDay: true };
  }
  const end = new Date(instant.getTime() + 2 * 60 * 60 * 1000);
  return { start: utcStamp(instant), end: utcStamp(end), allDay: false };
}

/**
 * Google Calendar template link. Guests ride on the undocumented-but-stable
 * `add` parameter; Google sends the invitations when the photographer saves.
 */
export function shareCalendarUrl(input: CalendarInput): string {
  const range = calendarRange(input);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: range.allDay
      ? `${range.start}/${range.end}`
      : `${range.start}/${range.end}`,
    details: `${input.details}\n\nRecap: ${input.url}`,
    location: input.location,
  });
  if (input.invitees.length > 0) {
    params.set("add", input.invitees.map((invitee) => invitee.email).join(","));
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value: string): string {
  return value
    .replace(ICS_BACKSLASH, "\\\\")
    .replace(ICS_NEWLINE, "\\n")
    .replace(ICS_COMMA, "\\,")
    .replace(ICS_SEMICOLON, "\\;");
}

/** RFC 5545 calendar for clients that do not want to open Google. */
export function buildIcs(input: CalendarInput, uid: string): string {
  const range = calendarRange(input);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shikanime Studio//Hikari//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    range.allDay
      ? `DTSTART;VALUE=DATE:${range.start}`
      : `DTSTART:${range.start}`,
    range.allDay ? `DTEND;VALUE=DATE:${range.end}` : `DTEND:${range.end}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    `LOCATION:${escapeIcs(input.location)}`,
    `DESCRIPTION:${escapeIcs(`${input.details}\n\nRecap: ${input.url}`)}`,
    ...input.invitees.map(
      (invitee) =>
        `ATTENDEE;CN=${escapeIcs(invitee.name || invitee.email)};RSVP=TRUE:mailto:${invitee.email}`,
    ),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.join("\r\n")}\r\n`;
}

export type StageState = "done" | "current" | "upcoming";

export interface ProgressStage {
  key: string;
  label: string;
  detail: string;
  state: StageState;
}

/**
 * The public recap tells the truth with the data at hand: no timer ticks a
 * stage forward on its own beyond the shoot date and the photos that exist.
 */
export function progressStages(input: {
  status: CommissionStatus;
  shootingDate: string | null;
  shootingInstant: Date | null;
  photoCount: number;
  now?: Date;
}): ProgressStage[] {
  const now = input.now ?? new Date();
  const shootHappened = Boolean(
    input.shootingInstant && input.shootingInstant.getTime() < now.getTime(),
  );
  const completed =
    input.status === "completed" || input.status === "delivered";
  const delivered = input.status === "delivered";
  const steps: Array<Omit<ProgressStage, "state"> & { done: boolean }> = [
    {
      key: "booked",
      label: "Booking received",
      detail: "The brief and the date are with the photographer.",
      done: true,
    },
    {
      key: "scheduled",
      label: "Shoot scheduled",
      detail: input.shootingDate
        ? "Date, time and place are confirmed."
        : "Waiting for a date to be agreed.",
      done: Boolean(input.shootingDate),
    },
    {
      key: "shoot",
      label: "Shoot day",
      detail: "The session itself, on location.",
      done: completed || shootHappened,
    },
    {
      key: "processing",
      label: "Processing",
      detail: "Selection, colour and retouching.",
      done: completed,
    },
    {
      key: "preview",
      label: "Preview ready",
      detail: "A first look at the edited frames.",
      done: input.photoCount > 0 || delivered,
    },
    {
      key: "delivered",
      label: "Final delivery",
      detail: "Full-resolution files, yours to keep.",
      done: delivered,
    },
  ];
  const currentIndex = steps.findIndex((step) => !step.done);
  return steps.map(({ done, ...stage }, index) => ({
    ...stage,
    state: done
      ? "done"
      : index === (currentIndex === -1 ? steps.length : currentIndex)
      ? "current"
      : "upcoming",
  }));
}
