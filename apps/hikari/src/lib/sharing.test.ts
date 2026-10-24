import { describe, expect, it } from "vitest";
import {
  buildIcs,
  parseInviteeInput,
  parseInvitees,
  progressStages,
  serializeInvitees,
  shareCalendarUrl,
  shootingInstant,
} from "./sharing";

describe("invitee input", () => {
  it("reads names, bare emails, duplicates and bad entries", () => {
    const result = parseInviteeInput(
      "Aiko <Aiko@Example.com>, aiko@example.com\nnot-an-email\nRen <ren@example.com>",
    );
    expect(result.invitees).toEqual([
      { name: "Aiko", email: "aiko@example.com" },
      { name: "Ren", email: "ren@example.com" },
    ]);
    expect(result.invalid).toEqual(["not-an-email"]);
  });

  it("round-trips stored invitees and tolerates junk", () => {
    const stored = serializeInvitees([{ name: "A", email: "a@example.com" }]);
    expect(parseInvitees(stored)).toEqual([{ name: "A", email: "a@example.com" }]);
    expect(parseInvitees("not json")).toEqual([]);
  });
});

describe("shooting instant", () => {
  it("reads wall time in the commission timezone", () => {
    expect(shootingInstant("2026-07-01T14:00", "Europe/Paris")?.toISOString()).toBe(
      "2026-07-01T12:00:00.000Z",
    );
    expect(shootingInstant("2026-01-15T14:00", "Europe/Paris")?.toISOString()).toBe(
      "2026-01-15T13:00:00.000Z",
    );
  });

  it("treats a date without time as a 09:00 local start", () => {
    expect(shootingInstant("2026-11-14", "Europe/Paris")?.toISOString()).toBe(
      "2026-11-14T08:00:00.000Z",
    );
  });
});

describe("calendar links", () => {
  it("carries UTC dates, the place and every guest", () => {
    const url = new URL(
      shareCalendarUrl({
        title: "Autumn portrait",
        details: "Bring the red coat",
        location: "Parc de Bercy",
        shootingDate: "2026-11-14T15:30",
        timeZone: "Europe/Paris",
        invitees: [{ name: "Aiko", email: "aiko@example.com" }],
        url: "https://hikari.shikanime.studio/s/abc",
      }),
    );
    expect(url.searchParams.get("dates")).toBe(
      "20261114T143000Z/20261114T163000Z",
    );
    expect(url.searchParams.get("location")).toBe("Parc de Bercy");
    expect(url.searchParams.get("add")).toBe("aiko@example.com");
    expect(url.searchParams.get("details")).toContain("/s/abc");
  });

  it("writes an ics guest list and the recap link", () => {
    const ics = buildIcs(
      {
        title: "Autumn portrait",
        details: "Bring the red coat",
        location: "Parc de Bercy",
        shootingDate: "2026-11-14T15:30",
        timeZone: "Europe/Paris",
        invitees: [{ name: "Aiko", email: "aiko@example.com" }],
        url: "https://hikari.shikanime.studio/s/abc",
      },
      "commission-1@hikari.shikanime.studio",
    );
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART:20261114T143000Z");
    expect(ics).toContain("ATTENDEE;CN=Aiko;RSVP=TRUE:mailto:aiko@example.com");
    expect(ics).toContain("DESCRIPTION:");
  });
});

describe("progress", () => {
  const base = {
    shootingDate: "2026-11-14T15:30",
    shootingInstant: new Date("2026-11-14T14:30:00Z"),
    now: new Date("2026-10-24T12:00:00Z"),
  };

  it("marks the booking done and the shoot next", () => {
    const stages = progressStages({
      ...base,
      status: "requested",
      photoCount: 0,
    });
    expect(stages[0]?.state).toBe("done");
    expect(stages[1]?.state).toBe("done");
    expect(stages[2]?.state).toBe("current");
    expect(stages.at(-1)?.state).toBe("upcoming");
  });

  it("closes every stage once delivered", () => {
    const stages = progressStages({
      ...base,
      now: new Date("2026-12-01T00:00:00Z"),
      status: "delivered",
      photoCount: 42,
    });
    expect(stages.every((stage) => stage.state === "done")).toBe(true);
  });

  it("keeps preview upcoming until a photo exists", () => {
    const stages = progressStages({
      ...base,
      now: new Date("2026-12-01T00:00:00Z"),
      status: "completed",
      photoCount: 0,
    });
    expect(stages.find((stage) => stage.key === "preview")?.state).toBe(
      "current",
    );
  });
});
