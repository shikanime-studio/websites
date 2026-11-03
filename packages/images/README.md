# @shikanime-studio/images

Everything fade does to an image short of drawing it on screen: parse the
container, expose its fields, mutate one in place, read EXIF, demosaic RAF,
render a thumbnail, compute a histogram, and build the WebGPU pipelines that
do it.

Pure functions and data. No state, no lifecycle, no React, no Effect — the
caller decides when a pipeline is built, cached or dropped.

## Layers

| Layer | Folder | What it owns |
| --- | --- | --- |
| Codec | `src/codec` | field model, decoding and encoding: `analysis`, `mutate`, `raf`, `raf-header`, `img`, `exif`, `raw`, `preview`, `exif-read`, `source` |
| Render | `src/render` | GPU work: `thumbnail`, `histogram`, `pipelines`, `shaders` |
| Worker | `src/worker` | the off-thread boundary: typed protocol, handler, client, host |

Three folders is the whole split. State, React and Effect deliberately live
outside the package: a codec has no lifecycle, and a renderer only needs a
device.

## Worker

The codec runs off the main thread. The package ships the protocol, the handler
and a client; the app supplies a three-line worker file.

```ts
// app worker entry
import { serveImageWorker } from "@shikanime-studio/images/worker";
serveImageWorker(globalThis as never);

// main thread
const client = createImageWorkerClient(
  new Worker(new URL("./images.worker.ts", import.meta.url), { type: "module" }),
);
const tags = await client.run("exif", { file, mimeType });
```

`run` is typed per task: the request kind decides the input and output type, and
each call carries an id so concurrent asks cannot resolve each other. A worker
error rejects everything in flight rather than leaving promises pending.

Where there is no `Worker` — SSR, tests — the same handler runs in-process, so
callers never branch on the environment:

```ts
export async function runImageTask<K>(
  kind: K,
  input: ImageWorkerTasks[K]["input"],
) {
  if (typeof Worker === "undefined") {
    return handleImageRequest({ id: 0, kind, input });
  }
  return workerClient().run(kind, input);
}
```

Today the worker owns the codec (EXIF, preview, container reads). Rendering
stays on the main thread because it needs the app's `GPUDevice`; moving it means
creating the device inside the worker and handing back `ImageBitmap`s — the next
step, not a rewrite.

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
