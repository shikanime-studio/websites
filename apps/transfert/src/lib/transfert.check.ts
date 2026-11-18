import assert from "node:assert/strict";
import process from "node:process";
import { expiryDate, newTransferId, TRANSFER_ID_LENGTH } from "./transfert";

function fakeRandom(): Uint8Array {
  return new Uint8Array([
    0xff, 0x03, 0x41, 0x42, 0x43, 0x01, 0x02, 0x03, 0x04, 0x05,
  ]);
}

const id = newTransferId(fakeRandom);

// id is url-safe base36, correct length
assert.equal(id.length, TRANSFER_ID_LENGTH);
assert.match(id, /^[0-9a-z]+$/);
// deterministic: same random -> same id
assert.equal(newTransferId(fakeRandom), id);

// ttl math
const now = new Date("2026-11-06T12:00:00Z");
const exp = expiryDate(now);
assert.equal(exp.getTime() - now.getTime(), 7 * 24 * 60 * 60 * 1000);

process.stdout.write(`transfert.check OK id=${id}\n`);
