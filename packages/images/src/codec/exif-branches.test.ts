import { describe, expect, it } from "vitest";
import {
  AsciiExifType,
  ByteExifType,
  ExifDataView,
  ExifOffsetTagId,
  LongExifType,
  MakeTagId,
  RationalExifType,
  ShortExifType,
  SRationalExifType,
} from "./exif";

function view(size = 64): { bytes: Uint8Array; exif: ExifDataView<ArrayBuffer> } {
  const bytes = new Uint8Array(size);
  return { bytes, exif: new ExifDataView(bytes.buffer) };
}

describe("getValue", () => {
  it("decodes each numeric type and refuses the rest", () => {
    const { bytes, exif } = view();
    const data = new DataView(bytes.buffer);
    data.setUint16(0, 42, true);
    data.setUint32(2, 70000, true);
    data.setUint32(6, 1, true);
    data.setUint32(10, 4, true);
    data.setInt32(14, -2, true);
    data.setInt32(18, 5, true);

    expect(exif.getValue(0, ShortExifType, true)).toBe(42);
    expect(exif.getValue(2, LongExifType, true)).toBe(70000);
    expect(exif.getValue(6, RationalExifType, true)).toBe(0.25);
    expect(exif.getValue(14, SRationalExifType, true)).toBe(-0.4);
    expect(exif.getValue(0, ByteExifType, true)).toBeNull();
  });
});

describe("getContainer", () => {
  it("returns strings for ascii and raw bytes for byte payloads", () => {
    const { bytes, exif } = view();
    bytes.set([0x41, 0x42, 0x00, 0x43], 0);

    expect(exif.getContainer(0, AsciiExifType, 4)).toBe("AB");
    expect(exif.getContainer(0, ByteExifType, 4)).toBeInstanceOf(ArrayBuffer);
    expect(exif.getContainer(0, LongExifType, 4)).toBeNull();
  });
});

describe("getTagEntry", () => {
  it("reads a value stored inline when it fits in four bytes", () => {
    const { bytes, exif } = view();
    const data = new DataView(bytes.buffer);
    data.setUint16(0, MakeTagId, true);
    data.setUint16(2, ShortExifType, true);
    data.setUint32(4, 1, true);
    data.setUint16(8, 0x1234, true);

    expect(exif.getTagEntry(0, true)).toEqual({
      tagId: MakeTagId,
      value: 0x1234,
    });
  });

  it("follows the offset when the value is larger than four bytes", () => {
    const { bytes, exif } = view();
    const data = new DataView(bytes.buffer);
    data.setUint16(0, MakeTagId, true);
    data.setUint16(2, AsciiExifType, true);
    data.setUint32(4, 6, true);
    data.setUint32(8, 20, true); // value lives at 20
    bytes.set([0x46, 0x75, 0x6A, 0x69, 0x00], 20);

    expect(exif.getTagEntry(0, true)).toEqual({
      tagId: MakeTagId,
      value: "Fuji",
    });
  });
});

describe("getTagEntries", () => {
  it("returns nothing when the first IFD offset is too small", () => {
    const { bytes, exif } = view();
    // Big-endian by default (no II marker), so the offset is written big-endian.
    new DataView(bytes.buffer).setUint32(4, 4, false);
    expect(exif.getTagEntries()).toEqual([]);
  });

  it("follows the Exif sub-IFD pointer", () => {
    const { bytes, exif } = view(96);
    const data = new DataView(bytes.buffer);

    // TIFF header: II, 42, IFD0 at 8
    data.setUint16(0, 0x4949, true);
    data.setUint16(2, 42, true);
    data.setUint32(4, 8, true);

    // IFD0: one entry pointing at IFD1 (offset 32)
    data.setUint16(8, 1, true);
    data.setUint16(10, ExifOffsetTagId, true);
    data.setUint16(12, LongExifType, true);
    data.setUint32(14, 1, true);
    data.setUint32(18, 32, true);
    data.setUint32(22, 0, true); // next IFD

    // IFD1: one Make entry
    data.setUint16(32, 1, true);
    data.setUint16(34, MakeTagId, true);
    data.setUint16(36, AsciiExifType, true);
    data.setUint32(38, 5, true);
    data.setUint32(42, 60, true);
    data.setUint32(46, 0, true);
    bytes.set([0x54, 0x65, 0x73, 0x74, 0x00], 60);

    const tags = exif.getTagEntries();
    expect(tags.map((tag) => tag.tagId)).toEqual([ExifOffsetTagId, MakeTagId]);
    expect(tags[1]?.value).toBe("Test");
  });
});
