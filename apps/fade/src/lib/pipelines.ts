import { Effect } from "effect";
import { make } from "effect/reactivity/Atom";
import histogramShader from "../shaders/histogram.wgsl?raw";
import thumbnailShader from "../shaders/thumbnail.wgsl?raw";
import { gpuDeviceAtom } from "./gpu-graph";

export const thumbnailPipelineAtom = make((get) =>
  Effect.gen(function* () {
    const device = yield* get.result(gpuDeviceAtom);
    if (!device) return null;

    const shaderModule = device.createShaderModule({ code: thumbnailShader });
    return device.createRenderPipeline({
      layout: "auto",
      vertex: { module: shaderModule, entryPoint: "vs_main" },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format: "rgba8unorm" }],
      },
      primitive: { topology: "triangle-strip" },
    });
  }),
);

export const histogramComputePipelineAtom = make((get) =>
  Effect.gen(function* () {
    const device = yield* get.result(gpuDeviceAtom);
    if (!device) return null;

    const shaderModule = device.createShaderModule({ code: histogramShader });
    return device.createComputePipeline({
      layout: "auto",
      compute: { module: shaderModule, entryPoint: "cs_main" },
    });
  }),
);

export const histogramNormalizePipelineAtom = make((get) =>
  Effect.gen(function* () {
    const device = yield* get.result(gpuDeviceAtom);
    if (!device) return null;

    const shaderModule = device.createShaderModule({ code: histogramShader });
    return device.createComputePipeline({
      layout: "auto",
      compute: { module: shaderModule, entryPoint: "cs_normalize" },
    });
  }),
);
