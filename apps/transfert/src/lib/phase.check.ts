import { strict as assert } from "node:assert";
import process from "node:process";
import { Phase, reduce } from "./phase";

const phaseError = Phase.Error;

// pick within quota -> uploading
assert.equal(
  reduce(Phase.Idle(), { _tag: "pick", size: 5, maxBytes: 10 })._tag,
  "Uploading",
);
// pick over quota -> error, no upload starts
assert.deepEqual(
  reduce(Phase.Idle(), { _tag: "pick", size: 11, maxBytes: 10 }),
  phaseError({ message: "File too large." }),
);
// full happy path
assert.deepEqual(
  reduce(Phase.Uploading(), { _tag: "linkReady", url: "/t/x" }),
  Phase.Done({ url: "/t/x" }),
);
// failure surface
assert.deepEqual(
  reduce(Phase.Uploading(), { _tag: "fail", message: "boom" }),
  phaseError({ message: "boom" }),
);
// reset from any phase
assert.equal(reduce(Phase.Done({ url: "u" }), { _tag: "reset" })._tag, "Idle");
assert.equal(reduce(phaseError({ message: "m" }), { _tag: "reset" })._tag, "Idle");

process.stdout.write("phase.check OK\n");
