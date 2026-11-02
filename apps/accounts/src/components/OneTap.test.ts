import { describe, expect, it } from "vitest";
import { oneTapDestination } from "../lib/one-tap";

describe("oneTapDestination", () => {
  it("follows the provider continuation for a signed OAuth request", () => {
    expect(
      oneTapDestination({
        redirect: true,
        url: "https://reiya.shikanime.studio/api/auth/callback?code=abc",
      }),
    ).toBe("https://reiya.shikanime.studio/api/auth/callback?code=abc");
  });

  it("opens the account center after a plain sign-in", () => {
    expect(oneTapDestination({ redirect: false })).toBe("/settings");
    expect(oneTapDestination(undefined)).toBe("/settings");
  });

  it("ignores a redirect flag without a usable url", () => {
    expect(oneTapDestination({ redirect: true })).toBe("/settings");
    expect(oneTapDestination({ redirect: true, url: "" })).toBe("/settings");
  });
});
