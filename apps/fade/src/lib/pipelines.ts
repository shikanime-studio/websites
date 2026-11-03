import {
  createHistogramComputePipeline,
  createHistogramNormalizePipeline,
  createThumbnailPipeline,
} from "@shikanime-studio/images";
import { Effect } from "effect";
import { make } from "effect/reactivity/Atom";
import { gpuDeviceAtom } from "./gpu-graph";

/** The graph owns *when* a pipeline exists; the image package owns *how*. */

export const thumbnailPipelineAtom = make((get) =>
  Effect.gen(function* () {
    const device = yield* get.result(gpuDeviceAtom);
    if (!device) return null;
    return createThumbnailPipeline(device);
  }),
);

export const histogramComputePipelineAtom = make((get) =>
  Effect.gen(function* () {
    const device = yield* get.result(gpuDeviceAtom);
    if (!device) return null;
    return createHistogramComputePipeline(device);
  }),
);

export const histogramNormalizePipelineAtom = make((get) =>
  Effect.gen(function* () {
    const device = yield* get.result(gpuDeviceAtom);
    if (!device) return null;
    return createHistogramNormalizePipeline(device);
  }),
);
