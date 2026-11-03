import { describe, expect, it } from "vitest";
import {
  ByteExifType,
  ExifDataView,
  isContainer,
  LongExifType,
  sizeOf,
} from "./exif";

describe("exif type helpers", () => {
  it("sizes every supported type and refuses the rest", () => {
    expect(sizeOf(ByteExifType)).toBe(1);
    expect(sizeOf(2)).toBe(1); // ascii
    expect(sizeOf(3)).toBe(2); // short
    expect(sizeOf(LongExifType)).toBe(4);
    expect(sizeOf(9)).toBe(4); // slong
    expect(sizeOf(5)).toBe(8); // rational
    expect(sizeOf(10)).toBe(8); // srational
    expect(sizeOf(7 as never)).toBe(0); // undefined type
  });

  it("treats ascii and byte as containers", () => {
    expect(isContainer(ByteExifType)).toBe(true);
    expect(isContainer(2)).toBe(true);
    expect(isContainer(LongExifType)).toBe(false);
  });
});

describe("exifDataView helpers", () => {
  it("trims at the terminator and pads short strings", () => {
    const bytes = new Uint8Array([0x41, 0x42, 0x00, 0x43, 0x00, 0x00]);
    const view = new ExifDataView(bytes.buffer);
    expect(view.getAscii(0, 6)).toBe("AB");
  });

  it("detects byte order", () => {
    const bytes = new Uint8Array([0x49, 0x49, 0x00, 0x00]);
    const view = new ExifDataView(bytes.buffer);
    expect(view.isLittleEndian()).toBe(true);

    bytes[0] = 0x4D;
    bytes[1] = 0x4D;
    expect(view.isLittleEndian()).toBe(false);
  });

  it("reads rationals and signed rationals", () => {
    const bytes = new Uint8Array(16);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 1, true);
    view.setUint32(4, 2, true);
    view.setInt32(8, -3, true);
    view.setInt32(12, 4, true);

    const exif = new ExifDataView(bytes.buffer);
    expect(exif.getRational(0, true)).toBe(0.5);
    expect(exif.getSRational(8, true)).toBe(-0.75);
  });

  it("reads a tag header", () => {
    const bytes = new Uint8Array(12);
    const view = new DataView(bytes.buffer);
    view.setUint16(0, 0x010F, true);
    view.setUint16(2, 2, true);
    view.setUint32(4, 5, true);

    const exif = new ExifDataView(bytes.buffer);
    expect(exif.getTagHeader(0, true)).toEqual({
      tagId: 0x010F,
      type: 2,
      count: 5,
    });
  });
});
