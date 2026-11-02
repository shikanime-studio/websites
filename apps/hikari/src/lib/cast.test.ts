import { describe, expect, it } from "vitest";
import {
  createInviteToken,
  inviteUrl,
  isInviteToken,
  isInviteUsable,
  normalizeCast,
  normalizeCharacters,
  parseCharacterInput,
} from "./cast";

describe("cast", () => {
  it("drops blanks and duplicates while keeping roles apart", () => {
    expect(
      normalizeCast([
        { role: "photographer", name: "  Aiko " },
        { role: "photographer", name: "aiko" },
        { role: "cosplayer", name: "aiko" },
        { role: "assistant", name: "   " },
      ]),
    ).toEqual([
      { role: "photographer", name: "Aiko" },
      { role: "cosplayer", name: "aiko" },
    ]);
  });

  it("caps the call sheet at twelve people", () => {
    const many = Array.from({ length: 20 }, (_, index) => ({
      role: "cosplayer" as const,
      name: `Person ${String(index)}`,
    }));
    expect(normalizeCast(many)).toHaveLength(12);
  });

  it("normalizes character pairs and keeps order", () => {
    expect(
      normalizeCharacters([
        { name: "Hu Tao", series: "Genshin Impact" },
        { name: "hu tao", series: "genshin impact" },
        { name: "Frieren", series: "" },
        { name: "  ", series: "Nope" },
      ]),
    ).toEqual([
      { name: "Hu Tao", series: "Genshin Impact" },
      { name: "Frieren", series: "" },
    ]);
  });

  it("reads the three shapes people type", () => {
    expect(parseCharacterInput("Hu Tao — Genshin Impact")).toEqual({
      name: "Hu Tao",
      series: "Genshin Impact",
    });
    expect(parseCharacterInput("Hu Tao (Genshin Impact)")).toEqual({
      name: "Hu Tao",
      series: "Genshin Impact",
    });
    expect(parseCharacterInput("Hu Tao")).toEqual({
      name: "Hu Tao",
      series: "",
    });
    expect(parseCharacterInput("   ")).toBeNull();
  });
});

describe("invitation links", () => {
  it("mints 32 hex characters and accepts only that shape", () => {
    const token = createInviteToken();
    expect(token).toMatch(/^[a-f0-9]{32}$/);
    expect(isInviteToken(token)).toBe(true);
    expect(isInviteToken("nope")).toBe(false);
    expect(isInviteToken(token.toUpperCase())).toBe(false);
  });

  it("carries the share token and the invite token on one URL", () => {
    expect(inviteUrl("abc123", "def456")).toBe("/s/abc123?invite=def456");
  });

  it("refuses revoked and expired links but accepts open ones", () => {
    const now = new Date("2026-10-26T12:00:00Z");
    expect(isInviteUsable({ revokedAt: null, expiresAt: null }, now)).toBe(true);
    expect(
      isInviteUsable({ revokedAt: now, expiresAt: null }, now),
    ).toBe(false);
    expect(
      isInviteUsable(
        { revokedAt: null, expiresAt: new Date("2026-10-25T12:00:00Z") },
        now,
      ),
    ).toBe(false);
    expect(
      isInviteUsable(
        { revokedAt: null, expiresAt: new Date("2026-11-25T12:00:00Z") },
        now,
      ),
    ).toBe(true);
  });
});
