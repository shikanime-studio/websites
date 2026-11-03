import type { Analysis } from "./analysis";
import { describe, expect, it } from "vitest";
import { applyRelocation, plan, read } from "./mutate";

function layout(overrides: { segment?: boolean; growable?: boolean } = {}): {
  view: DataView;
  analysis: Analysis;
} {
  const bytes = new Uint8Array(64);
  const view = new DataView(bytes.buffer);
  // Length of segment "s" lives at 0 (u16, big-endian).
  view.setUint16(0, 16, false);
  // A field after the segment, so a shift is observable.
  view.setUint32(32, 0x11223344, false);

  const analysis: Analysis = {
    format: "tiff",
    byteLength: 64,
    endian: "be",
    fields: new Map([
      ["sLen", { id: "sLen", kind: "u16", offset: 0, reserved: 2, endian: "be" }],
      [
        "note",
        {
          id: "note",
          kind: "ascii",
          offset: 12,
          reserved: 4,
          endian: "be",
          segment: overrides.segment === false ? undefined : "s",
        },
      ],
      ["after", { id: "after", kind: "u32", offset: 32, reserved: 4, endian: "be" }],
    ]),
    segments: [
      {
        id: "s",
        start: 8,
        length: 16,
        lengthField: "sLen",
        growable: overrides.growable !== false,
      },
    ],
  };
  return { view, analysis };
}

describe("relocation", () => {
  it("appends a grown value at the end of its segment and shifts what follows", () => {
    const { analysis } = layout();
    const planned = plan(analysis, { _tag: "ascii", id: "note", value: "toolong" });

    expect(planned._tag).toBe("relocated");
    if (planned._tag !== "relocated") return;
    const { analysis: moved, removed, inserted, writes } = planned.relocated;

    expect(removed).toEqual({ at: 12, length: 4 });
    expect(inserted.at).toBe(24); // end of the segment, before the cut
    expect(inserted.bytes.byteLength).toBe(8);
    expect(moved.byteLength).toBe(68); // 64 - 4 + 8
    // Segment ends at 24; cutting the 4-byte slot moves that end to 20.
    expect(moved.fields.get("note")).toMatchObject({ offset: 20, reserved: 8 });
    expect(moved.fields.get("after")?.offset).toBe(36);
    expect(moved.segments[0]).toMatchObject({ start: 8, length: 20 });
    expect(writes).toHaveLength(1);
    expect(writes[0]?.offset).toBe(0);
  });

  it("produces a file whose new value and shifted field both read back", () => {
    const { view, analysis } = layout();
    const planned = plan(analysis, { _tag: "ascii", id: "note", value: "toolong" });
    if (planned._tag !== "relocated") throw new Error("expected relocation");

    const out = applyRelocation(view, planned.relocated);
    const next = new DataView(out.buffer);
    const moved = planned.relocated.analysis;

    expect(out.byteLength).toBe(68);
    expect(read(next, moved, "note")).toBe("toolong");
    expect(next.getUint32(36, false)).toBe(0x11223344); // untouched, just moved
    expect(next.getUint16(0, false)).toBe(20); // segment length patched
  });

  it("patches the length field through its own descriptor", () => {
    const { view, analysis } = layout();
    const planned = plan(analysis, { _tag: "ascii", id: "note", value: "muchlonger" });
    if (planned._tag !== "relocated") throw new Error("expected relocation");

    const out = applyRelocation(view, planned.relocated);
    const length = new DataView(out.buffer).getUint16(0, false);
    expect(length).toBe(16 + ("muchlonger".length + 1 - 4));
  });

  it("refuses to relocate a value with no owning segment", () => {
    const { analysis } = layout({ segment: false });
    expect(
      plan(analysis, { _tag: "ascii", id: "note", value: "toolong" }),
    ).toEqual({
      _tag: "needsRelocation",
      id: "note",
      required: 8,
    });
  });

  it("refuses to relocate into a segment that cannot grow", () => {
    const { analysis } = layout({ growable: false });
    expect(
      plan(analysis, { _tag: "ascii", id: "note", value: "toolong" })._tag,
    ).toBe("needsRelocation");
  });

  it("still writes fixed-width values in place", () => {
    const { analysis } = layout();
    const planned = plan(analysis, { _tag: "number", id: "after", value: 7 });
    expect(planned._tag).toBe("ok");
    if (planned._tag !== "ok") return;
    expect(planned.planned.analysis).toBe(analysis);
    expect(planned.planned.writes[0]?.offset).toBe(32);
  });
});
