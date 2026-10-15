// Smallest runnable check of the render math (no DOM — node tsx):
//   pnpm test
import assert from "node:assert/strict";
import process from "node:process";
import { COLS, RAMP, ROWS } from "./luma";

// Mirror of renderFrame's mapping without canvas: alpha in [0,1] -> ramp cell.
function rampIndex(a: number): number {
  return Math.min(RAMP.length - 1, Math.floor(a * RAMP.length));
}

// blank and full frames hit the ramp endpoints
assert.equal(rampIndex(0), 0);
assert.equal(rampIndex(1), RAMP.length - 1);
// midpoint lands past blank
assert.ok(rampIndex(0.5) > 0);
// clamped above 1
assert.equal(rampIndex(1.5), RAMP.length - 1);
// grid shape is fixed
assert.ok(COLS > 0 && ROWS > 0 && RAMP.length === 10);
process.stdout.write(`luma check ok — ${ROWS}×${COLS}, ramp ${RAMP.length}\n`);
