import type { FlagshipBinding } from "@cloudflare/flagship/server";
import { describe, expect, it } from "vitest";
import { fallbacks, resolveFlags } from "./server";

const flags = {
  placePin: { key: "place-pin", fallback: true },
  newCheckout: { key: "new-checkout", fallback: false },
} as const;

describe("fallbacks", () => {
  it("maps every local name to its declared fallback", () => {
    expect(fallbacks(flags)).toEqual({ placePin: true, newCheckout: false });
  });
});

describe("resolveFlags", () => {
  it("answers with the fallbacks when no binding is present", async () => {
    await expect(
      resolveFlags({ binding: undefined, flags }),
    ).resolves.toEqual({ placePin: true, newCheckout: false });
  });

  it("keeps the declared fallbacks when the binding cannot answer", async () => {
    const binding = {
      getBooleanValue: async () => {
        throw new Error("flagship unreachable");
      },
    } as unknown as FlagshipBinding;
    // Every evaluation fails, so the registry's fallbacks are the answer.
    await expect(resolveFlags({ binding, flags })).resolves.toEqual({
      placePin: true,
      newCheckout: false,
    });
  });
});
