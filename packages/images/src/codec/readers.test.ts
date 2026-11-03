import type { ImageSource } from "./source";
import { describe, expect, it } from "vitest";
import { createImageDataView, JpegDataView, PngDataView, TiffDataView, WebPDataView } from "./img";
import { RafDataView } from "./raf";
import { createRawImageDataView } from "./raw";

const source = (bytes: Uint8Array, mimeType: string): ImageSource => ({
  mimeType,
  getFile: async () =>
    new File([bytes.slice().buffer], "fixture", { type: mimeType }),
});

describe("createImageDataView", () => {
  it("picks the reader from the MIME type", async () => {
    expect(await createImageDataView(source(new Uint8Array(4), "image/jpeg"))).toBeInstanceOf(JpegDataView);
    expect(await createImageDataView(source(new Uint8Array(4), "image/png"))).toBeInstanceOf(PngDataView);
    expect(await createImageDataView(source(new Uint8Array(4), "image/webp"))).toBeInstanceOf(WebPDataView);
    expect(await createImageDataView(source(new Uint8Array(4), "image/tiff"))).toBeInstanceOf(TiffDataView);
    expect(await createImageDataView(source(new Uint8Array(4), "image/x-fujifilm-raf"))).toBeInstanceOf(RafDataView);
  });

  it("returns null for anything else", async () => {
    expect(await createImageDataView(source(new Uint8Array(4), "image/avif"))).toBeNull();
    expect(
      await createImageDataView({
        mimeType: undefined,
        getFile: async () => new File([], "x"),
      }),
    ).toBeNull();
  });
});

describe("createRawImageDataView", () => {
  it("only opens RAF payloads", async () => {
    expect(await createRawImageDataView(source(new Uint8Array(4), "image/jpeg"))).toBeNull();
    expect(await createRawImageDataView(source(new Uint8Array(4), "image/x-fujifilm-raf"))).toBeInstanceOf(RafDataView);
  });
});

describe("jpegDataView.getExif", () => {
  const exifTags = () => new Uint8Array(0);

  it("returns null for an empty payload", () => {
    expect(new JpegDataView(new ArrayBuffer(0)).getExif()).toBeNull();
  });

  it("stops at a marker that is not a segment", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0x12, 0x34, 0x00, 0x00]);
    expect(new JpegDataView(bytes.buffer).getExif()).toBeNull();
  });

  it("skips an APP1 segment that is not EXIF", () => {
    const bytes = new Uint8Array(16);
    const view = new DataView(bytes.buffer);
    view.setUint16(0, 0xffd8); // SOI
    view.setUint16(2, 0xffe1); // APP1
    view.setUint16(4, 14); // segment length
    view.setUint32(6, 0x4a464946); // 'JFIF', not 'Exif'
    view.setUint16(10, 0);
    view.setUint16(12, 0xffda); // a second marker so the loop continues

    expect(new JpegDataView(bytes.buffer).getExif()).toBeNull();
  });

  it("breaks when a marker is cut short", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe1]);
    expect(new JpegDataView(bytes.buffer).getExif()).toBeNull();
    expect(new JpegDataView(new Uint8Array(0).buffer).getExif()).toBeNull();
    expect(exifTags()).toHaveLength(0);
  });
});

describe("pngDataView.getExif", () => {
  it("returns null without a signature or chunk", () => {
    expect(new PngDataView(new Uint8Array(4).buffer).getExif()).toBeNull();
  });

  it("stops when a chunk runs past the end", () => {
    const bytes = new Uint8Array(16);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 0x89504e47);
    view.setUint32(4, 0x0d0a1a0a);
    view.setUint32(8, 4096); // chunk length far beyond the payload

    expect(new PngDataView(bytes.buffer).getExif()).toBeNull();
  });

  it("walks past unknown chunks and stops at the end", () => {
    const bytes = new Uint8Array(24);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 0x89504e47);
    view.setUint32(4, 0x0d0a1a0a);
    view.setUint32(8, 4); // chunk length
    view.setUint32(12, 0x49444154); // 'IDAT'

    expect(new PngDataView(bytes.buffer).getExif()).toBeNull();
  });
});

describe("webPDataView.getExif", () => {
  it("returns null without a RIFF header", () => {
    expect(new WebPDataView(new Uint8Array(4).buffer).getExif()).toBeNull();
  });

  it("pads odd chunk lengths while scanning", () => {
    const bytes = new Uint8Array(32);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 0x52494646); // RIFF
    view.setUint32(8, 0x57454250); // WEBP
    view.setUint32(12, 0x56503820); // 'VP8 '
    view.setUint32(16, 3, true); // odd chunk length → one padding byte

    expect(new WebPDataView(bytes.buffer).getExif()).toBeNull();
  });
});

describe("tiffDataView", () => {
  it("is its own EXIF directory", () => {
    const view = new TiffDataView(new Uint8Array(8).buffer);
    expect(view.getExif()).toBe(view);
  });
});
