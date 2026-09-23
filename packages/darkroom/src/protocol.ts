/**
 * Typed message protocol between main thread and ImageWorker.
 *
 * Main → Worker messages carry a `requestId` for correlation.
 * Worker → Main results carry the matching `requestId`.
 */

import type { ExifTagEntry } from "./parsers/exif";

export type { ExifTagEntry } from "./parsers/exif";

// ── Main → Worker ────────────────────────────────────────────────

export type MainToWorkerMessage =
  | { action: "init" }
  | { action: "parseRaw"; requestId: string; data: ArrayBuffer; mimeType: string }
  | { action: "getExif"; requestId: string; data: ArrayBuffer; mimeType: string }
  | { action: "demosaic"; requestId: string; data: ArrayBuffer; mimeType: string };

// ── Worker → Main ────────────────────────────────────────────────

export type WorkerToMainMessage =
  | { type: "ready" }
  | { type: "rawParsed"; requestId: string; frame: RawFrameInfo }
  | { type: "exifParsed"; requestId: string; tags: ExifTagEntry[] }
  | { type: "demosaiced"; requestId: string; width: number; height: number; pixels: Uint8ClampedArray }
  | { type: "error"; requestId?: string; message: string };

// ── Shared data types ────────────────────────────────────────────

export interface RawFrameInfo {
  width: number;
  height: number;
  bitDepth: number;
  cfa: Uint16Array;
  /** Make inferred from EXIF, used for demosaic pattern selection */
  make: string | null;
}

export type { ImageDimensions } from "./parsers/image";
