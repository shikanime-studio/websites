# @shikanime-studio/images

Everything fade does to an image short of drawing it on screen: parse the
container, expose its fields, mutate one in place, read EXIF, demosaic RAF,
render a thumbnail, compute a histogram, and build the WebGPU pipelines that
do it.

Pure functions and data. No state, no lifecycle, no React, no Effect — the
caller decides when a pipeline is built, cached or dropped.

## What is here

| Area | Files |
| --- | --- |
| Field model | `analysis.ts` — `PhotoFormat`, `Field`, `Segment`, `Analysis`, `validate()` |
| Mutation | `mutate.ts` — `plan` (pure), `apply` (only writer), `read` |
| Containers | `raf.ts` (RAW + offsets), `img.ts` (JPEG/PNG/WebP/TIFF views), `raw.ts` |
| Metadata | `exif.ts` — TIFF/EXIF directory walking |
| Rendering | `thumbnail.ts`, `histogram.ts` |
| GPU | `pipelines.ts` — five pipeline builders, shaders in `src/shaders` |
| Input | `source.ts` — `ImageSource`, the two things a reader needs from a file |

The formats are a closed `PhotoFormat` union (`raf`, `jpeg`, `tiff`, `png`,
`webp`), so the surface cannot drift into "anything with bytes".

## Reading and mutating

```ts
import {
  analyzeRafHeader,
  apply,
  plan,
  read,
  validate,
} from "@shikanime-studio/images";

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

A same-width write returns the **same** analysis instance: the descriptor is
already in sync. A value longer than its reservation is reported as
`needsRelocation` — never truncated.

## Reading a file

```ts
const view = await createImageDataView({ mimeType, getFile });
const exif = view?.getExif()?.getTagEntries() ?? [];
```

`ImageSource` is deliberately two members: a MIME type and a way to get the
`File`. A directory handle, a drag-and-drop item or a fetch wrapper all adapt to
it in one line.

## Pipelines

`createThumbnailPipeline`, `createHistogramComputePipeline`,
`createHistogramNormalizePipeline`, `createImagePipeline(device, format)` and
`createRawPipeline(device, format)` return the pipeline for a given device. They
never create a device and never cache: fade's atom graph owns that, which is
what keeps this package free of state.

## Adding an image format

1. Parse the header once and return an `Analysis` (see `src/raf-header.ts`).
2. Declare every length-bearing container as a `Segment` with `lengthField`, and
   every checksum as `checksum`, even before those paths are implemented.
3. Keep relative offsets (TIFF/EXIF) relative: store the base in the segment and
   resolve at write time.
4. Add the container to `PhotoFormat` — the union is the scope of the package.

## What is not here yet

Relocation planning (grow a value, patch its referrers), checksum recomputation,
and the writers that would use them.
