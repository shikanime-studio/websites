import type { Analysis } from "./analysis";
import { describe, expect, it } from "vitest";
import { apply, plan, read } from "./mutate";

function descriptor(
  kind: "u8" | "u16" | "u32" | "i32" | "ascii",
  endian: "le" | "be" = "be",
  reserved = 4,
): { analysis: Analysis; view: DataView } {
  const bytes = new Uint8Array(16);
  return {
    analysis: {
      format: "raf",
      byteLength: 16,
      endian,
      fields: new Map([
        ["v", { id: "v", kind, offset: 4, reserved, endian }],
      ]),
      segments: [],
    },
    view: new DataView(bytes.buffer),
  };
}

describe("plan — numbers", () => {
  it("writes unsigned bytes at their boundaries", () => {
    const { analysis } = descriptor("u8", "be", 1);
    expect(plan(analysis, { _tag: "number", id: "v", value: 0 })._tag).toBe("ok");
    expect(plan(analysis, { _tag: "number", id: "v", value: 255 })._tag).toBe(
      "ok",
    );
  });

  it("refuses numbers a kind cannot hold", () => {
    const { analysis } = descriptor("u8", "be", 1);
    for (const value of [-1, 256, 1.5]) {
      expect(plan(analysis, { _tag: "number", id: "v", value })).toEqual({
        _tag: "outOfRange",
        id: "v",
        value,
      });
    }
  });

  it("respects the signed 32-bit range", () => {
    const { analysis } = descriptor("i32");
    expect(
      plan(analysis, { _tag: "number", id: "v", value: -0x80000000 })._tag,
    ).toBe("ok");
    expect(
      plan(analysis, { _tag: "number", id: "v", value: 0x7fffffff })._tag,
    ).toBe("ok");
    expect(
      plan(analysis, { _tag: "number", id: "v", value: 0x80000000 })._tag,
    ).toBe("outOfRange");
  });

  it("honours byte order", () => {
    const big = descriptor("u16", "be", 2);
    const little = descriptor("u16", "le", 2);
    const value = 0x1234;

    const bigPlan = plan(big.analysis, { _tag: "number", id: "v", value });
    const littlePlan = plan(little.analysis, { _tag: "number", id: "v", value });
    if (bigPlan._tag !== "ok" || littlePlan._tag !== "ok") throw new Error("plan");

    expect([...bigPlan.planned.writes[0]!.bytes]).toEqual([0x12, 0x34]);
    expect([...littlePlan.planned.writes[0]!.bytes]).toEqual([0x34, 0x12]);
  });
});

describe("plan — ascii", () => {
  it("accepts an empty string and writes a terminator", () => {
    const { analysis, view } = descriptor("ascii", "be", 4);
    const planned = plan(analysis, { _tag: "ascii", id: "v", value: "" });
    if (planned._tag !== "ok") throw new Error("plan");

    apply(view, planned.planned);
    expect([...new Uint8Array(view.buffer, 4, 4)]).toEqual([0, 0, 0, 0]);
    expect(read(view, analysis, "v")).toBe("");
  });

  it("accepts a value that exactly fills the reservation minus the terminator", () => {
    const { analysis } = descriptor("ascii", "be", 5);
    expect(plan(analysis, { _tag: "ascii", id: "v", value: "abcd" })._tag).toBe(
      "ok",
    );
  });

  it("reports how much room a longer value needs", () => {
    const { analysis } = descriptor("ascii", "be", 5);
    expect(plan(analysis, { _tag: "ascii", id: "v", value: "abcde" })).toEqual({
      _tag: "needsRelocation",
      id: "v",
      required: 6,
    });
  });
});

describe("read", () => {
  it("returns null for an unknown field", () => {
    const { analysis, view } = descriptor("u8");
    expect(read(view, analysis, "nope")).toBeNull();
  });

  it("reads ascii that fills its reservation without a terminator", () => {
    const { analysis, view } = descriptor("ascii", "be", 4);
    new Uint8Array(view.buffer, 4, 4).set([0x41, 0x42, 0x43, 0x44]);
    expect(read(view, analysis, "v")).toBe("ABCD");
  });

  it("round-trips every numeric kind", () => {
    for (const [kind, value] of [
      ["u8", 200],
      ["u16", 40000],
      ["u32", 4_000_000_000],
      ["i32", -123456],
    ] as const) {
      const { analysis, view } = descriptor(kind);
      const planned = plan(analysis, { _tag: "number", id: "v", value });
      if (planned._tag !== "ok") throw new Error("plan");
      apply(view, planned.planned);
      expect(read(view, analysis, "v")).toBe(value);
    }
  });
});

describe("apply", () => {
  it("refuses a write that runs past the buffer", () => {
    const { view } = descriptor("u16");
    expect(() =>
      apply(view, {
        analysis: descriptor("u16").analysis,
        writes: [{ offset: 15, bytes: new Uint8Array([0, 0]) }],
      }),
    ).toThrow(RangeError);
  });

  it("returns the same view it wrote into", () => {
    const { analysis, view } = descriptor("u8", "be", 1);
    const planned = plan(analysis, { _tag: "number", id: "v", value: 7 });
    if (planned._tag !== "ok") throw new Error("plan");
    expect(apply(view, planned.planned)).toBe(view);
  });
});
