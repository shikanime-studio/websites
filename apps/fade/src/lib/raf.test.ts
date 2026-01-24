import { describe, expect, it } from "vitest";
import { MakeTagId } from "./exif";
import { createRawImageDataView } from "./raw";
import {
  CfaHeaderLength,
  CfaHeaderOffset,
  CfaLength,
  CfaOffset,
  JpegImageLength,
  JpegImageOffset,
  QualityTagId,
  SharpnessTagId,
} from "./raf";
import type { FileItem } from "./fs";
import type { ExifTagEntry } from "./exif";

// Mock FileItem creator
function createFileItem(file: File): FileItem {
  return {
    handle: {
      getFile: () => Promise.resolve(file),
    } as unknown as FileSystemFileHandle,
    sidecars: [],
    mimeType: file.type,
  };
}

// Helper to create EXIF data block
function createExifBlock(make = "Test") {
  const makeLen = make.length + 1; // +1 for null terminator

  // TIFF Header: II (little endian), 42, offset 8
  const tiffHeader = new Uint8Array([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
  ]);

  // IFD0: 1 entry
  const ifd0Count = new Uint8Array([0x01, 0x00]);

  // Entry: Make (0x010f), ASCII (2), count, offset 26
  const entry = new Uint8Array(12);
  const entryView = new DataView(entry.buffer);
  entryView.setUint16(0, 0x010f, true); // Tag
  entryView.setUint16(2, 0x0002, true); // Type (ASCII)
  entryView.setUint32(4, makeLen, true); // Count
  entryView.setUint32(8, 26, true); // Value/Offset (26)

  // Next IFD offset: 0
  const nextIfd = new Uint8Array([0x00, 0x00, 0x00, 0x00]);

  // Data: "Test\0"
  const dataStr = make + "\0";
  const dataBytes = new Uint8Array(dataStr.length);
  for (let i = 0; i < dataStr.length; i++) dataBytes[i] = dataStr.charCodeAt(i);

  // Combine EXIF data
  const exifData = new Uint8Array(
    tiffHeader.length +
      ifd0Count.length +
      entry.length +
      nextIfd.length +
      dataBytes.length,
  );
  exifData.set(tiffHeader, 0);
  exifData.set(ifd0Count, tiffHeader.length);
  exifData.set(entry, tiffHeader.length + ifd0Count.length);
  exifData.set(nextIfd, tiffHeader.length + ifd0Count.length + entry.length);
  exifData.set(
    dataBytes,
    tiffHeader.length + ifd0Count.length + entry.length + nextIfd.length,
  );

  return exifData;
}

// Helper to create Fuji CFA Header block
function createFujiBlock() {
  // Count: 3 entries
  const count = 3;
  const countBytes = new Uint8Array(4);
  new DataView(countBytes.buffer).setUint32(0, count, false); // Big Endian

  // Entry 1: Quality (0x1000), "FINE" (4 bytes)
  const tag1Id = 0x1000;
  const tag1Value = "FINE";
  const tag1Size = tag1Value.length;

  const entry1 = new Uint8Array(4 + tag1Size);
  const view1 = new DataView(entry1.buffer);
  view1.setUint16(0, tag1Id, false);
  view1.setUint16(2, tag1Size, false);
  for (let i = 0; i < tag1Size; i++) {
    entry1[4 + i] = tag1Value.charCodeAt(i);
  }

  // Entry 2: Sharpness (0x1001), value 3 (Normal) -> Uint16
  const tag2Id = 0x1001;
  const tag2Value = 3; // "Normal"
  const tag2Size = 2;

  const entry2 = new Uint8Array(4 + tag2Size);
  const view2 = new DataView(entry2.buffer);
  view2.setUint16(0, tag2Id, false);
  view2.setUint16(2, tag2Size, false);
  view2.setUint16(4, tag2Value, false);

  // Entry 3: Dimensions (0x0111), height=100, width=200
  const tag3Id = 0x0111;
  const tag3Size = 4;
  const height = 100;
  const width = 200;

  const entry3 = new Uint8Array(4 + tag3Size);
  const view3 = new DataView(entry3.buffer);
  view3.setUint16(0, tag3Id, false);
  view3.setUint16(2, tag3Size, false);
  view3.setUint16(4, height, false);
  view3.setUint16(6, width, false);

  // Combine
  const totalLength =
    countBytes.length + entry1.length + entry2.length + entry3.length;
  const block = new Uint8Array(totalLength);
  let offset = 0;
  block.set(countBytes, offset);
  offset += countBytes.length;
  block.set(entry1, offset);
  offset += entry1.length;
  block.set(entry2, offset);
  offset += entry2.length;
  block.set(entry3, offset);

  return block;
}

describe("createRawImageDataView", () => {
  it("should extract EXIF tags from RAF (Fujifilm)", async () => {
    // Create a valid JPEG with EXIF
    const exifData = createExifBlock("Fujifilm XT-5");
    const soi = new Uint8Array([0xff, 0xd8]);
    const app1Marker = new Uint8Array([0xff, 0xe1]);
    const exifHeader = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
    const segmentLengthVal = 2 + exifHeader.length + exifData.length;
    const segmentLength = new Uint8Array([
      (segmentLengthVal >> 8) & 0xff,
      segmentLengthVal & 0xff,
    ]);

    const jpegData = new Uint8Array(
      soi.length +
        app1Marker.length +
        segmentLength.length +
        exifHeader.length +
        exifData.length,
    );
    let offset = 0;
    jpegData.set(soi, offset);
    offset += soi.length;
    jpegData.set(app1Marker, offset);
    offset += app1Marker.length;
    jpegData.set(segmentLength, offset);
    offset += segmentLength.length;
    jpegData.set(exifHeader, offset);
    offset += exifHeader.length;
    jpegData.set(exifData, offset);

    // Create RAF structure
    // Header needs to be at least 100 bytes
    const rafHeader = new Uint8Array(100);
    const headerView = new DataView(rafHeader.buffer);

    // Offset to JPEG Image Offset is at 84 (Big Endian)
    // We'll put the JPEG right after the header (offset 100)
    headerView.setUint32(JpegImageOffset, 100, false);

    // Length of JPEG Image is at 88 (Big Endian)
    headerView.setUint32(JpegImageLength, jpegData.length, false);

    const rafData = new Uint8Array(rafHeader.length + jpegData.length);
    rafData.set(rafHeader, 0);
    rafData.set(jpegData, rafHeader.length);

    const file = new File([rafData], "test.raf", {
      type: "image/x-fujifilm-raf",
    });
    const item = createFileItem(file);
    const view = await createRawImageDataView(item);
    const tags = view?.getJpegImage()?.getExif()?.getTagEntries();

    expect(tags).toBeDefined();
    const makeTag = tags?.find((t: ExifTagEntry) => t.tagId === MakeTagId);
    expect(makeTag).toBeDefined();
    expect(makeTag?.value).toBe("Fujifilm XT-5");
  });

  it("should extract Fuji tags from RAF", async () => {
    const fujiData = createFujiBlock();

    // Create RAF structure
    const headerSize = 100;
    const rafHeader = new Uint8Array(headerSize);
    const headerView = new DataView(rafHeader.buffer);

    // Place fujiData at offset 100
    const fujiOffset = 100;
    headerView.setUint32(CfaHeaderOffset, fujiOffset, false);
    headerView.setUint32(CfaHeaderLength, fujiData.length, false);

    // Construct file
    const rafData = new Uint8Array(fujiOffset + fujiData.length);
    rafData.set(rafHeader, 0);
    rafData.set(fujiData, fujiOffset);

    const file = new File([rafData], "test_fuji.raf", {
      type: "image/x-fujifilm-raf",
    });
    const item = createFileItem(file);
    const view = await createRawImageDataView(item);
    const tags = view?.getCfaHeader()?.getTagEntries();

    expect(tags).toBeDefined();
    const qualityTag = tags?.find(
      (t) => t.tagId === (QualityTagId as number),
    );
    expect(qualityTag?.value).toBe("FINE");

    const sharpnessTag = tags?.find(
      (t) => t.tagId === (SharpnessTagId as number),
    );
    expect(sharpnessTag?.value).toBe(3);
  });

  it("should extract CFA data without validation", async () => {
    // Create RAF structure
    // Header needs to be large enough to contain CfaOffset (100) and CfaLength (104)
    const headerSize = 120;
    const rafHeader = new Uint8Array(headerSize);
    const headerView = new DataView(rafHeader.buffer);

    const cfaData = new Uint16Array([1, 2, 3, 4]); // 8 bytes
    const cfaOffset = headerSize;
    const cfaLength = cfaData.byteLength;

    headerView.setUint32(CfaOffset, cfaOffset, false);
    headerView.setUint32(CfaLength, cfaLength, false);

    const rafData = new Uint8Array(cfaOffset + cfaLength);
    rafData.set(rafHeader, 0);
    rafData.set(new Uint8Array(cfaData.buffer), cfaOffset);

    const file = new File([rafData], "test_cfa.raf", {
      type: "image/x-fujifilm-raf",
    });
    const item = createFileItem(file);
    const view = await createRawImageDataView(item);

    const cfa = view?.getCfa();
    expect(cfa).toBeDefined();
    if (!cfa) throw new Error("CFA data not found");
    const cfaArray = new Uint16Array(
      cfa.buffer,
      cfa.byteOffset,
      cfa.byteLength / 2,
    );
    expect(cfaArray).toEqual(cfaData);
  });
});
