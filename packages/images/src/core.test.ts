import type { Analysis } from "./analysis";
import { describe, expect, it } from "vitest";
import { validate } from "./analysis";
import { apply, plan, read } from "./mutate";
import { analyzeRafHeader, JpegImageLength } from "./raf";

function rafHeader(): DataView {
  const bytes = new Uint8Array(256);
  const view = new DataView(bytes.buffer);
  view.setUint32(84, 128, false); // jpeg offset
  view.setUint32(88, 64, false); // jpeg length
  view.setUint32(92, 192, false); // cfa header offset
  view.setUint32(96, 32, false); // cfa header length
  view.setUint32(100, 224, false); // cfa offset
  view.setUint32(104, 32, false); // cfa length
  return new DataView(bytes.buffer);
}

function asciiAnalysis(reserved: number): Analysis {
  return {
    format: "tiff",
    byteLength: 32,
    endian: "le",
    fields: new Map([
      ["make", { id: "make", kind: "ascii" as const, offset: 4, reserved, endian: "le" as const }],
      ["iso", { id: "iso", kind: "u16" as const, offset: 20, reserved: 2, endian: "le" as const }],
    ]),
    segments: [],
  };
}

describe("analysis", () => {
  it("parses the RAF header into fields and segments", () => {
    const analysis = analyzeRafHeader(rafHeader());
    expect(validate(analysis)).toEqual([]);
    expect(analysis.fields.get("jpegImageLength")?.offset).toBe(JpegImageLength);
    expect(analysis.segments.map((segment) => segment.id)).toEqual([
      "jpeg",
      "cfaHeader",
      "cfa",
    ]);
  });

  it("reports a descriptor that points outside the buffer", () => {
    const analysis: Analysis = {
      ...asciiAnalysis(4),
      byteLength: 8,
    };
    expect(validate(analysis)).toEqual([
      "field iso: [20, 22) outside 8 bytes",
    ]);
  });
});

describe("mutate", () => {
  it("plans and applies a same-width number without touching other bytes", () => {
    const view = rafHeader();
    const analysis = analyzeRafHeader(view);
    const before = new Uint8Array(view.buffer.slice(0));

    const planned = plan(analysis, {
      _tag: "number",
      id: "jpegImageLength",
      value: 128,
    });
    expect(planned._tag).toBe("ok");
    if (planned._tag !== "ok") return;

    expect(planned.planned.writes).toHaveLength(1);
    expect(planned.planned.writes[0]?.offset).toBe(JpegImageLength);
    expect(planned.planned.analysis).toBe(analysis);

    apply(view, planned.planned);

    expect(read(view, analysis, "jpegImageLength")).toBe(128);
    const after = new Uint8Array(view.buffer);
    const changed = [...after.keys()].filter((i) => after[i] !== before[i]);
    expect(changed).toEqual([91]); // only the low byte of the length moved
  });

  it("writes ascii values inside the reserved bytes, padded with NUL", () => {
    const bytes = new Uint8Array(32);
    const view = new DataView(bytes.buffer);
    const analysis = asciiAnalysis(8);

    const planned = plan(analysis, { _tag: "ascii", id: "make", value: "Fuji" });
    expect(planned._tag).toBe("ok");
    if (planned._tag !== "ok") return;

    apply(view, planned.planned);
    expect(read(view, analysis, "make")).toBe("Fuji");
    expect([...new Uint8Array(bytes.buffer, 4, 8)]).toEqual([
      0x46, 0x75, 0x6A, 0x69, 0, 0, 0, 0,
    ]);
  });

  it("refuses to truncate a value longer than its reservation", () => {
    const analysis = asciiAnalysis(4);
    const planned = plan(analysis, {
      _tag: "ascii",
      id: "make",
      value: "Fujifilm",
    });
    expect(planned).toEqual({ _tag: "needsRelocation", id: "make", required: 9 });
  });

  it("refuses a number the field cannot hold", () => {
    const analysis = asciiAnalysis(8);
    expect(plan(analysis, { _tag: "number", id: "iso", value: 70000 })).toEqual({
      _tag: "outOfRange",
      id: "iso",
      value: 70000,
    });
  });

  it("reports an unknown field instead of guessing", () => {
    const analysis = asciiAnalysis(8);
    expect(plan(analysis, { _tag: "number", id: "nope", value: 1 })).toEqual({
      _tag: "unknownField",
      id: "nope",
    });
  });
});
