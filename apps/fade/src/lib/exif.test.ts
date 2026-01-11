import { describe, expect, it } from "vitest";
import { getExifTags } from "./exif";
import type { FileItem } from "./fs";

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

describe("getExifTags", () => {
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
    for (let i = 0; i < dataStr.length; i++)
      dataBytes[i] = dataStr.charCodeAt(i);

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

  it("should extract EXIF tags from JPEG", async () => {
    const exifData = createExifBlock("JPEG");

    // JPEG SOI
    const soi = new Uint8Array([0xff, 0xd8]);

    // APP1 Marker (FFE1) + Length (2 bytes) + Exif Header (6 bytes: Exif\0\0)
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

    const file = new File([jpegData], "test.jpg", { type: "image/jpeg" });
    const tags = await getExifTags(createFileItem(file));
    expect(tags.make).toBe("JPEG");
  });

  it("should extract EXIF tags from PNG", async () => {
    const exifData = createExifBlock("PNG ");

    const pngSignature = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    // Chunk Length
    const chunkLen = new Uint8Array(4);
    new DataView(chunkLen.buffer).setUint32(0, exifData.length);

    // Chunk Type: eXIf
    const chunkType = new Uint8Array([0x65, 0x58, 0x49, 0x66]);

    // Chunk CRC (dummy)
    const crc = new Uint8Array([0x00, 0x00, 0x00, 0x00]);

    const pngData = new Uint8Array(
      pngSignature.length +
        chunkLen.length +
        chunkType.length +
        exifData.length +
        crc.length,
    );
    let offset = 0;
    pngData.set(pngSignature, offset);
    offset += pngSignature.length;
    pngData.set(chunkLen, offset);
    offset += chunkLen.length;
    pngData.set(chunkType, offset);
    offset += chunkType.length;
    pngData.set(exifData, offset);
    offset += exifData.length;
    pngData.set(crc, offset);

    const file = new File([pngData], "test.png", { type: "image/png" });
    const tags = await getExifTags(createFileItem(file));
    expect(tags.make).toBe("PNG");
  });

  it("should extract EXIF tags from WebP", async () => {
    const exifData = createExifBlock("WebP");

    // RIFF Header
    const riffHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46]); // RIFF
    const webpHeader = new Uint8Array([0x57, 0x45, 0x42, 0x50]); // WEBP

    // EXIF Chunk Header
    const exifChunkId = new Uint8Array([0x45, 0x58, 0x49, 0x46]); // EXIF
    const exifChunkLen = new Uint8Array(4);
    new DataView(exifChunkLen.buffer).setUint32(0, exifData.length, true); // Little endian

    // Total file size (excluding 'RIFF' and size field)
    const fileSizeVal = 4 + (8 + exifData.length) + (exifData.length % 2); // WEBP + (ChunkHeader + Data) + Padding
    const fileSize = new Uint8Array(4);
    new DataView(fileSize.buffer).setUint32(0, fileSizeVal, true);

    const webpData = new Uint8Array(
      riffHeader.length +
        fileSize.length +
        webpHeader.length +
        exifChunkId.length +
        exifChunkLen.length +
        exifData.length +
        (exifData.length % 2),
    );
    let offset = 0;
    webpData.set(riffHeader, offset);
    offset += riffHeader.length;
    webpData.set(fileSize, offset);
    offset += fileSize.length;
    webpData.set(webpHeader, offset);
    offset += webpHeader.length;
    webpData.set(exifChunkId, offset);
    offset += exifChunkId.length;
    webpData.set(exifChunkLen, offset);
    offset += exifChunkLen.length;
    webpData.set(exifData, offset);
    offset += exifData.length;
    // Padding if needed (though our createExifBlock returns even length usually, check make string)

    const file = new File([webpData], "test.webp", { type: "image/webp" });
    const tags = await getExifTags(createFileItem(file));
    expect(tags.make).toBe("WebP");
  });

  it("should extract EXIF tags from TIFF", async () => {
    const exifData = createExifBlock("TIFF");
    const file = new File([exifData], "test.tiff", { type: "image/tiff" });
    const tags = await getExifTags(createFileItem(file));
    expect(tags.make).toBe("TIFF");
  });
});
