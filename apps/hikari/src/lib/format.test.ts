import { describe, expect, it } from "vitest";
import { formatShootDate, formatTimestamp } from "./format";

describe("formatShootDate", () => {
  it("formats an all-day shoot without inventing a time", () => {
    const label = formatShootDate("2026-05-04", "en");

    expect(label).toContain("4");
    expect(label).toContain("May");
    expect(label).not.toMatch(/\d{1,2}:\d{2}/);
  });

  it("keeps the time of a timed shoot", () => {
    expect(formatShootDate("2026-05-04T14:30", "en")).toContain("14:30");
  });

  it("uses the requested locale", () => {
    expect(formatShootDate("2026-05-04", "fr")).toMatch(/mai/i);
  });

  it("returns the raw value when the date is invalid", () => {
    expect(formatShootDate("not-a-date", "en")).toBe("not-a-date");
  });
});

describe("formatTimestamp", () => {
  it("formats epoch milliseconds for the locale", () => {
    const label = formatTimestamp(Date.UTC(2026, 4, 4, 12, 0), "en");

    expect(label).toContain("May");
    expect(label).toContain("4");
  });
});
