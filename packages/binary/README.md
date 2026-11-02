# @shikanime-studio/binary

Read and mutate binary fields through one immutable descriptor. No classes,
no hidden state, no per-format read/write paths.

```ts
import {
  analyzeRafHeader,
  apply,
  plan,
  read,
  validate,
} from "@shikanime-studio/binary";

const analysis = analyzeRafHeader(view); // what lives where
validate(analysis); // invariants: [] means safe to write

const result = plan(analysis, {
  _tag: "number",
  id: "jpegImageLength",
  value: 128,
}); // pure: bytes to write, buffer untouched

if (result._tag === "ok") {
  apply(view, result.planned); // writes only the planned ranges
}
```

## The contract

| Piece | Meaning |
| --- | --- |
| `Analysis` | immutable map of fields (offset, kind, reserved bytes, endian) and the segments that own them |
| `plan(analysis, mutation)` | pure: a value change becomes exact `Write[]`, or a refusal |
| `apply(view, planned)` | the only function that touches bytes |
| `read(view, analysis, id)` | the same descriptor, other direction |
| `validate(analysis)` | problems that would make a write unsafe |

A same-width write returns the **same** analysis instance: the descriptor is
already in sync. A value longer than its reservation is reported as
`needsRelocation` — never truncated.

## Adding a format

1. Parse the header once and return an `Analysis` (see `src/raf.ts`, 60 lines).
2. Declare every length-bearing container as a `Segment` with `lengthField`,
   and every checksum as `checksum`, even before those paths are implemented.
3. Keep relative offsets (TIFF/EXIF) relative: store the base in the segment
   and resolve at write time.

## What is not here yet

Relocation planning (grow a value, patch its referrers), checksum
recomputation, and the readers that will migrate onto this contract.
