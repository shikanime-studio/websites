import { describe, expect, it } from "vitest";
import { STATUS_BADGE_VARIANT, statusVariant } from "./status";

describe("statusVariant", () => {
  it("maps every lifecycle stage to a badge variant", () => {
    expect(statusVariant("requested")).toBe("purple");
    expect(statusVariant("accepted")).toBe("blue");
    expect(statusVariant("scheduled")).toBe("yellow");
    expect(statusVariant("completed")).toBe("orange");
    expect(statusVariant("delivered")).toBe("green");
  });

  it("keeps the map and the helper in sync", () => {
    for (const [status, variant] of Object.entries(STATUS_BADGE_VARIANT)) {
      expect(statusVariant(status as keyof typeof STATUS_BADGE_VARIANT)).toBe(
        variant,
      );
    }
  });
});
