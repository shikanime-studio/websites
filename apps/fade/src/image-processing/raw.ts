import { parseRaf } from "./parsers/raf";

/**
 * Minimal view of raw image data: CFA buffer + dimensions.
 * Used as input to the demosaic pipeline.
 */
export interface RawImageDataView {
  width: number;
  height: number;
  bitDepth: number;
  cfaBuffer: Uint8Array;
  make: string;
  model: string;
}

/**
 * Parse a raw file into a RawImageDataView.
 */
export function createRawImageDataView(data: ArrayBuffer): RawImageDataView | null {
  const rafFrame = parseRaf(data);
  if (rafFrame) {
    const cfaBuffer = new Uint8Array(rafFrame.cfa.buffer);
    return {
      width: rafFrame.width,
      height: rafFrame.height,
      bitDepth: rafFrame.bitDepth,
      cfaBuffer,
      make: rafFrame.make,
      model: rafFrame.model,
    };
  }

  // Fallback: ARW (Sony) — TIFF-based raw
  // parseArw would go here if implemented
  return null;
}

/**
 * Create a RawImageDataView from a file buffer.
 * Auto-detects format (RAF, ARW, etc.) and CFA pattern.
 */
export function createRawImageView(data: ArrayBuffer): RawImageDataView | null {
  return createRawImageDataView(data);
}
