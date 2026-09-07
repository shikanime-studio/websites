/// <reference lib="webworker" />

/**
 * ImageWorker — WebWorker entry point for image processing.
 *
 * Receives messages from the main thread, performs CPU-intensive work
 * (EXIF parsing, RAF parsing, demosaicing) off-thread, and posts results
 * back.
 */

import { parseRaf } from "./parsers/raf";
import { ExifDataView, JpegDataView, PngDataView, WebPDataView, TiffDataView, ExifTagId } from "./parsers/exif";
import { getImageDimensions, detectFormat, ImageFormat } from "./parsers/image";
import { demosaic, detectCfaPattern } from "./demosaic";
import type { MainToWorkerMessage, WorkerToMainMessage } from "./protocol";

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener("message", (event: MessageEvent<MainToWorkerMessage>) => {
  const message = event.data;

  switch (message.action) {
    case "init":
      postMessage({ type: "ready" } satisfies WorkerToMainMessage);
      break;

    case "parseRaw": {
      const result = handleParseRaw(message.data);
      if (result) {
        postMessage({ type: "rawParsed", requestId: message.requestId, frame: result } satisfies WorkerToMainMessage);
      } else {
        postMessage({ type: "error", requestId: message.requestId, message: "Failed to parse raw image" } satisfies WorkerToMainMessage);
      }
      break;
    }

    case "getExif": {
      const tags = handleExif(message.data);
      postMessage({ type: "exifParsed", requestId: message.requestId, tags } satisfies WorkerToMainMessage);
      break;
    }

    case "demosaic": {
      const result = handleDemosaic(message.data);
      if (result) {
        postMessage({ type: "demosaiced", requestId: message.requestId, width: result.width, height: result.height, pixels: result.pixels } satisfies WorkerToMainMessage);
      } else {
        postMessage({ type: "error", requestId: message.requestId, message: "Failed to demosaic image" } satisfies WorkerToMainMessage);
      }
      break;
    }
  }
});

function handleParseRaw(data: ArrayBuffer): { width: number; height: number; bitDepth: number; cfa: Uint16Array; make: string | null } | null {
  // Try RAF first
  const rafResult = parseRaf(data);
  if (rafResult) {
    return {
      width: rafResult.width,
      height: rafResult.height,
      bitDepth: rafResult.bitDepth,
      cfa: rafResult.cfa,
      make: rafResult.make,
    };
  }

  // Fallback: detect format and dimensions
  const dims = getImageDimensions(data);
  if (!dims) return null;

  return {
    width: dims.width,
    height: dims.height,
    bitDepth: dims.bitDepth,
    cfa: new Uint16Array(0),
    make: null,
  };
}

function handleExif(data: ArrayBuffer): any[] {
  try {
    const view = new DataView(data);
    let exifView: ExifDataView | null = null;

    switch (detectFormat(view)) {
      case ImageFormat.Jpeg:
        exifView = new JpegDataView(data).getExif();
        break;
      case ImageFormat.Png:
        exifView = new PngDataView(data).getExif();
        break;
      case ImageFormat.Webp:
        exifView = new WebPDataView(data).getExif();
        break;
      case ImageFormat.Tiff:
        exifView = new TiffDataView(data).getExif();
        break;
      default:
        return [];
    }

    if (!exifView) return [];

    // Return entries with human-readable tag names
    const entries = exifView.getTagEntries();
    return entries.map((entry) => ({
      tagId: entry.tagId,
      tagName: ExifTagName[entry.tagId] ?? `0x${entry.tagId.toString(16)}`,
      type: entry.type,
      value: entry.value,
    }));
  } catch {
    return [];
  }
}

function handleDemosaic(data: ArrayBuffer): { width: number; height: number; pixels: Uint8ClampedArray } | null {
  // Try RAF
  const rafResult = parseRaf(data);
  if (rafResult && rafResult.cfa.length > 0) {
    const pattern = detectCfaPattern(rafResult.make);
    const result = demosaic(rafResult.cfa, rafResult.width, rafResult.height, pattern, rafResult.bitDepth, rafResult.make);
    return result;
  }

  return null;
}

const ExifTagName: Record<number, string> = {
  [ExifTagId.Make]: "Make",
  [ExifTagId.Model]: "Model",
  [ExifTagId.ExposureTime]: "ExposureTime",
  [ExifTagId.FNumber]: "FNumber",
  [ExifTagId.ISO]: "ISOSpeedRatings",
  [ExifTagId.DateTimeOriginal]: "DateTimeOriginal",
  [ExifTagId.FocalLength]: "FocalLength",
  [ExifTagId.LensModel]: "LensModel",
};
