export const LOCALE_MAP = {
  en: "en-GB",
  fr: "fr-FR",
  ja: "ja-JP",
} as const;

export type Locale = keyof typeof LOCALE_MAP;

/**
 * Shooting dates are stored either as `YYYY-MM-DD` (all-day) or as
 * `YYYY-MM-DDTHH:mm` (local shoot time). Date-only values are formatted
 * without a time so the UI never invents a 00:00 shoot.
 */
export function formatShootDate(
  value: string,
  locale: string,
  style: "short" | "long" = "short",
): string {
  const intlLocale =
    Object.entries(LOCALE_MAP).find(([code]) => code === locale)?.[1] ??
    locale;
  const hasTime = value.includes("T");
  const date = hasTime ? new Date(value) : new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(intlLocale, {
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
    ...(style === "long" ? { year: "numeric" } : {}),
    ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function formatTimestamp(value: Date | number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const RELATIVE_STEPS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["week", 1000 * 60 * 60 * 24 * 7],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
];

export function formatRelative(
  timestamp: Date | number,
  locale: string,
  now: number = Date.now(),
): string {
  const timestampMs = timestamp instanceof Date ? timestamp.getTime() : timestamp;
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  });
  const delta = timestampMs - now;
  for (const [unit, ms] of RELATIVE_STEPS) {
    if (Math.abs(delta) >= ms) {
      return formatter.format(Math.round(delta / ms), unit);
    }
  }
  return formatter.format(0, "minute");
}
