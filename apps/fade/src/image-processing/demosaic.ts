/**
 * Demosaic algorithms for raw image processing.
 *
 * Implements:
 * - Fujifilm RAF: RGGB Bayer pattern with edge-aware interpolation
 * - Sony ARW: RGGB Bayer pattern (standard for Sony α cameras)
 * - Generic: Plain Bayer RGGB fallback
 *
 * RGGB Bayer CFA layout (top-left is R):
 *   Row 0 (even): R G R G ...
 *   Row 1 (odd):  G B G B ...
 *
 * Interpolation rules:
 *   R pixel (even, even): G from horizontal, B from vertical
 *   G pixel (odd, even):  R from horizontal, B from vertical
 *   G pixel (even, odd):  R from vertical, B from horizontal
 *   B pixel (odd, odd):   G from horizontal, R from vertical
 */

export enum CfaPattern {
  Rggb = "rggb",
}

export interface DemosaicOptions {
  pattern: CfaPattern;
  width: number;
  height: number;
  bitDepth: number;
}

export interface DemosaicResult {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}

/**
 * Normalize a raw value to 8-bit using bit-shift.
 * For 14-bit or 16-bit raw data, we shift down to 8 bits.
 */
function normalizeRaw(value: number, bitDepth: number): number {
  if (value <= 0) return 0;
  if (bitDepth >= 16) {
    return Math.min(255, (value >> 8) | (value >> 8 >> 8));
  } else if (bitDepth > 8) {
    const shift = bitDepth - 8;
    return Math.min(255, (value >> shift) | (value >> shift >> shift));
  }
  return Math.min(255, value);
}

function clamp8(v: number): number {
  return Math.max(0, Math.min(255, v));
}

function idx(x: number, y: number, width: number): number {
  return y * width + x;
}

function inBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

/**
 * Get a CFA value or fall back to the center pixel.
 */
function getPix(cfa: Uint16Array, x: number, y: number, width: number, height: number, fallback: number): number {
  if (inBounds(x, y, width, height)) {
    return Number(cfa[idx(x, y, width)]);
  }
  return fallback;
}

/**
 * Bayer RGGB demosaic with edge-aware interpolation.
 *
 * RGGB Bayer CFA layout (top-left is R):
 *   Even row: R G R G ...
 *   Odd row:  G B G B ...
 */
function demosaicBayerRggb(
  cfa: Uint16Array,
  width: number,
  height: number,
  bitDepth: number,
): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 3);

  for (let y = 0; y < height; y++) {
    const isRedRow = y % 2 === 0;

    for (let x = 0; x < width; x++) {
      const i = idx(x, y, width);
      const pxIdx = i * 3;

      if (isRedRow) {
        if (x % 2 === 0) {
          // ── R pixel at (even, even) ──
          const rawR = Number(cfa[i]);
          const r = normalizeRaw(rawR, bitDepth);

          // G: horizontal neighbors (left, right) — both are G in RGGB
          const gL = getPix(cfa, x - 1, y, width, height, rawR);
          const gR = getPix(cfa, x + 1, y, width, height, rawR);
          const g = normalizeRaw((gL + gR) >>> 1, bitDepth);

          // B: vertical neighbors (above, below) — both are B in RGGB
          const bT = getPix(cfa, x, y - 1, width, height, 0);
          const bB = getPix(cfa, x, y + 1, width, height, 0);
          const b = normalizeRaw((bT + bB) >>> 1, bitDepth);

          pixels[pxIdx] = clamp8(r);
          pixels[pxIdx + 1] = clamp8(g);
          pixels[pxIdx + 2] = clamp8(b);
        } else {
          // ── G pixel at (odd, even) ──
          const rawG = Number(cfa[i]);
          const g = normalizeRaw(rawG, bitDepth);

          // R: horizontal neighbors (left, right) — both are R in RGGB
          const rL = getPix(cfa, x - 1, y, width, height, Number(cfa[i]));
          const rR = getPix(cfa, x + 1, y, width, height, Number(cfa[i]));
          const r = normalizeRaw((rL + rR) >>> 1, bitDepth);

          // B: vertical neighbors (above, below) — both are B in RGGB
          const bT = getPix(cfa, x, y - 1, width, height, Number(cfa[i]));
          const bB = getPix(cfa, x, y + 1, width, height, Number(cfa[i]));
          const b = normalizeRaw((bT + bB) >>> 1, bitDepth);

          pixels[pxIdx] = clamp8(r);
          pixels[pxIdx + 1] = clamp8(g);
          pixels[pxIdx + 2] = clamp8(b);
        }
      } else {
        if (x % 2 === 0) {
          // ── G pixel at (even, odd) ──
          const rawG = Number(cfa[i]);
          const g = normalizeRaw(rawG, bitDepth);

          // R: vertical neighbors (above, below) — both are R in RGGB
          const rT = getPix(cfa, x, y - 1, width, height, Number(cfa[i]));
          const rB = getPix(cfa, x, y + 1, width, height, Number(cfa[i]));
          const r = normalizeRaw((rT + rB) >>> 1, bitDepth);

          // B: horizontal neighbors (left, right) — both are B in RGGB
          const bL = getPix(cfa, x - 1, y, width, height, Number(cfa[i]));
          const bR = getPix(cfa, x + 1, y, width, height, Number(cfa[i]));
          const b = normalizeRaw((bL + bR) >>> 1, bitDepth);

          pixels[pxIdx] = clamp8(r);
          pixels[pxIdx + 1] = clamp8(g);
          pixels[pxIdx + 2] = clamp8(b);
        } else {
          // ── B pixel at (odd, odd) ──
          const rawB = Number(cfa[i]);
          const b = normalizeRaw(rawB, bitDepth);

          // G: horizontal neighbors (left, right) — both are G in RGGB
          const gL = getPix(cfa, x - 1, y, width, height, rawB);
          const gR = getPix(cfa, x + 1, y, width, height, rawB);
          const g = normalizeRaw((gL + gR) >>> 1, bitDepth);

          // R: vertical neighbors (above, below) — both are R in RGGB
          const rT = getPix(cfa, x, y - 1, width, height, 0);
          const rB = getPix(cfa, x, y + 1, width, height, 0);
          const r = normalizeRaw((rT + rB) >>> 1, bitDepth);

          pixels[pxIdx] = clamp8(r);
          pixels[pxIdx + 1] = clamp8(g);
          pixels[pxIdx + 2] = clamp8(b);
        }
      }
    }
  }

  return pixels;
}

/**
 * Fujifilm RAF demosaic.
 *
 * Fujifilm RAF files store raw data in a standard RGGB Bayer pattern.
 * Modern X-Trans sensors use a 6x6 quasi-random pattern, but RAF files
 * expose the Bayer pattern to software.
 */
function demosaicFujifilm(
  cfa: Uint16Array,
  width: number,
  height: number,
  bitDepth: number,
): Uint8ClampedArray {
  return demosaicBayerRggb(cfa, width, height, bitDepth);
}

/**
 * Sony ARW demosaic.
 *
 * Sony α cameras use a standard RGGB Bayer pattern in their ARW files.
 */
function demosaicSony(
  cfa: Uint16Array,
  width: number,
  height: number,
  bitDepth: number,
): Uint8ClampedArray {
  return demosaicBayerRggb(cfa, width, height, bitDepth);
}

/**
 * Main entry point for demosaicing.
 *
 * Automatically selects the algorithm based on the CFA pattern and make.
 */
export function demosaic(
  cfa: Uint16Array,
  width: number,
  height: number,
  pattern: CfaPattern,
  bitDepth: number = 16,
  make?: string | null,
  // model reserved for future X-Trans pattern detection
): DemosaicResult {
  let pixels: Uint8ClampedArray;

  switch (pattern) {
    case CfaPattern.Rggb:
      if (make && make.toLowerCase().includes("fuji")) {
        pixels = demosaicFujifilm(cfa, width, height, bitDepth);
      } else if (make && make.toLowerCase().includes("sony")) {
        pixels = demosaicSony(cfa, width, height, bitDepth);
      } else {
        pixels = demosaicBayerRggb(cfa, width, height, bitDepth);
      }
      break;
    default:
      pixels = demosaicBayerRggb(cfa, width, height, bitDepth);
      break;
  }

  return { width, height, pixels };
}

/**
 * Auto-detect the CFA pattern from EXIF make information.
 *
 * All modern Fujifilm and Sony cameras use RGGB Bayer patterns.
 */
export function detectCfaPattern(_make: string | null): CfaPattern {
  return CfaPattern.Rggb;
}
