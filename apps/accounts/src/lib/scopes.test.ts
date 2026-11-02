import { describe, expect, it } from "vitest";
import { describeScope } from "./scopes";

describe("describeScope", () => {
  it("explains the identity scopes in plain words", () => {
    expect(describeScope("openid")).toBe("Confirm your identity");
    expect(describeScope("profile")).toBe("Your name and profile picture");
    expect(describeScope("email")).toBe("Your email address");
  });

  it("explains offline access", () => {
    expect(describeScope("offline_access")).toBe(
      "Stay connected while you're away",
    );
  });

  it("falls back to the raw scope for unknown values", () => {
    expect(describeScope("custom:write")).toBe("custom:write");
  });
});
