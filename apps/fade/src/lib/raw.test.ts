import { describe, expect, it } from "vitest";
import { ExifTagId } from "./exif";
import { RafOffset, createRawImageDataView } from "./raw";
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
    headerView.setUint32(RafOffset.JpegImageOffset, 100, false);

    // Length of JPEG Image is at 88 (Big Endian)
    headerView.setUint32(RafOffset.JpegImageLength, jpegData.length, false);

    const rafData = new Uint8Array(rafHeader.length + jpegData.length);
    rafData.set(rafHeader, 0);
    rafData.set(jpegData, rafHeader.length);

    const file = new File([rafData], "test.raf", {
      type: "image/x-fujifilm-raf",
    });
    const item = createFileItem(file);
    const view = await createRawImageDataView(item);
    const tags = view?.getExif(0)?.getTagEntries(0);

    expect(tags).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const makeTag = tags?.find((t: ExifTagEntry) => t.tagId === ExifTagId.Make);
    expect(makeTag).toBeDefined();
    expect(makeTag?.value).toBe("Fujifilm XT-5");
  });
});
