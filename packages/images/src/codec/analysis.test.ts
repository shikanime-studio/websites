import type { Analysis, Field } from "./analysis";
import { describe, expect, it } from "vitest";
import { fieldWidth, validate } from "./analysis";

const field = (overrides: Partial<Field> = {}): Field => ({
  id: "f",
  kind: "u32",
  offset: 0,
  reserved: 4,
  endian: "be",
  ...overrides,
});

const analysis = (fields: Field[], byteLength = 16): Analysis => ({
  format: "raf",
  byteLength,
  endian: "be",
  fields: new Map(fields.map((item) => [item.id, item])),
  segments: [],
});

describe("fieldWidth", () => {
  it("knows every numeric width and treats ascii as variable", () => {
    expect(fieldWidth("u8")).toBe(1);
    expect(fieldWidth("u16")).toBe(2);
    expect(fieldWidth("u32")).toBe(4);
    expect(fieldWidth("i32")).toBe(4);
    expect(fieldWidth("ascii")).toBe(0);
  });
});

describe("validate", () => {
  it("accepts a sound descriptor", () => {
    expect(validate(analysis([field()]))).toEqual([]);
  });

  it("rejects a numeric field narrower than its kind", () => {
    expect(validate(analysis([field({ reserved: 2 })]))).toEqual([
      "field f: reserved 2 < width 4",
    ]);
  });

  it("allows an ascii field with no reserved width", () => {
    expect(validate(analysis([field({ kind: "ascii", reserved: 0 })]))).toEqual(
      [],
    );
  });

  it("rejects a field that starts before the buffer", () => {
    expect(validate(analysis([field({ offset: -1 })]))).toEqual([
      "field f: [-1, 3) outside 16 bytes",
    ]);
  });

  it("rejects a field that claims an undeclared segment", () => {
    expect(validate(analysis([field({ segment: "ghost" })]))).toEqual([
      "field f: unknown segment ghost",
    ]);
  });

  it("rejects a segment that runs past the buffer", () => {
    const withSegment: Analysis = {
      ...analysis([field()], 16),
      segments: [{ id: "s", start: 8, length: 16 }],
    };
    expect(validate(withSegment)).toEqual([
      "segment s: [8, 24) outside 16 bytes",
    ]);
  });

  it("rejects a segment whose length field is not declared", () => {
    const withSegment: Analysis = {
      ...analysis([field()], 16),
      segments: [{ id: "s", start: 0, length: 4, lengthField: "missing" }],
    };
    expect(validate(withSegment)).toEqual([
      "segment s: length field missing is not declared",
    ]);
  });
});
