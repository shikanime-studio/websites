import { describe, expect, it } from "vitest";
import { JpegDataView } from "./img";
import {
  CfaHeaderLength,
  CfaHeaderOffset,
  CfaLength,
  CfaOffset,
  JpegImageLength,
  JpegImageOffset,
  QualityTagId,
  RafCfaHeaderDataView,
  RafDataView,
  SharpnessTagId,
} from "./raf";

function raf(offsets: {
  jpeg?: [number, number];
  header?: [number, number];
  cfa?: [number, number];
}): RafDataView<ArrayBuffer> {
  const bytes = new Uint8Array(256);
  const view = new DataView(bytes.buffer);
  if (offsets.jpeg) {
    view.setUint32(JpegImageOffset, offsets.jpeg[0], false);
    view.setUint32(JpegImageLength, offsets.jpeg[1], false);
  }
  if (offsets.header) {
    view.setUint32(CfaHeaderOffset, offsets.header[0], false);
    view.setUint32(CfaHeaderLength, offsets.header[1], false);
  }
  if (offsets.cfa) {
    view.setUint32(CfaOffset, offsets.cfa[0], false);
    view.setUint32(CfaLength, offsets.cfa[1], false);
  }
  return new RafDataView(bytes.buffer);
}

describe("rafDataView segments", () => {
  it("returns nothing when a pointer is zero", () => {
    const view = raf({});
    expect(view.getJpegImage()).toBeNull();
    expect(view.getCfaHeader()).toBeNull();
    expect(view.getCfa()).toBeNull();
  });

  it("returns nothing when a segment runs past the file", () => {
    const view = raf({
      jpeg: [32, 4096],
      header: [32, 4096],
      cfa: [32, 4096],
    });
    expect(view.getJpegImage()).toBeNull();
    expect(view.getCfaHeader()).toBeNull();
    expect(view.getCfa()).toBeNull();
  });

  it("exposes each segment when it fits", () => {
    const view = raf({
      jpeg: [128, 8],
      header: [192, 4],
      cfa: [200, 4],
    });

    const jpeg = view.getJpegImage();
    expect(jpeg).toBeInstanceOf(JpegDataView);
    expect(jpeg?.byteLength).toBe(8);

    const header = view.getCfaHeader();
    expect(header?.byteLength).toBe(4);

    const cfa = view.getCfa();
    expect(cfa?.byteLength).toBe(4);
  });
});

describe("rafCfaHeaderDataView", () => {
  it("trims trailing NULs from strings", () => {
    const bytes = new Uint8Array([0x53, 0x74, 0x64, 0x00, 0x00]);
    const view = new RafCfaHeaderDataView(bytes.buffer);
    expect(view.getString(0, 5)).toBe("Std");
  });

  it("reads entries, skipping unknown tags and keeping the rest", () => {
    // count = 2
    // entry 1: Quality 0x1000, size 4, "Std\0"
    // entry 2: Sharpness 0x1001, size 2, 0x0003
    const bytes = new Uint8Array(4 + (4 + 4) + (4 + 2));
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 2, false);

    view.setUint16(4, QualityTagId, false);
    view.setUint16(6, 4, false);
    bytes.set([0x53, 0x74, 0x64, 0x00], 8);

    view.setUint16(12, SharpnessTagId, false);
    view.setUint16(14, 2, false);
    view.setUint16(16, 3, false);

    const header = new RafCfaHeaderDataView(bytes.buffer);
    expect(header.getTagEntries()).toEqual([
      { tagId: QualityTagId, value: "Std" },
      { tagId: SharpnessTagId, value: 3 },
    ]);
  });

  it("drops entries whose tag is unknown", () => {
    const bytes = new Uint8Array(4 + 4 + 2);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 1, false);
    view.setUint16(4, 0x7fff, false); // unknown tag
    view.setUint16(6, 2, false);
    view.setUint16(8, 9, false);

    const header = new RafCfaHeaderDataView(bytes.buffer);
    expect(header.getTagEntries()).toEqual([]);
  });
});
