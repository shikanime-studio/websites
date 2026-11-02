import { Effect } from "effect";
import { make } from "effect/reactivity/Atom";
import histogramShader from "../shaders/histogram.wgsl?raw";
import imageShader from "../shaders/image.wgsl?raw";
import rafShader from "../shaders/raf.wgsl?raw";
import thumbnailShader from "../shaders/thumbnail.wgsl?raw";
import { gpuDeviceAtom, gpuFormatAtom } from "./gpu-graph";

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

/**
 * The preview pipeline for the current device and swap-chain format. Building
 * it is synchronous, so it belongs to the graph rather than to a component's
 * render path; a device or format change re-evaluates the atom.
 */
export const imageRenderPipelineAtom = make((get) =>
  Effect.gen(function* () {
    const device = yield* get.result(gpuDeviceAtom);
    const format = yield* get.result(gpuFormatAtom);
    if (!device || !format) return null;

    const shaderModule = device.createShaderModule({ code: imageShader });
    return device.createRenderPipeline({
      layout: "auto",
      vertex: { module: shaderModule, entryPoint: "vs_main" },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [
          {
            format,
            blend: {
              color: {
                srcFactor: "src-alpha",
                dstFactor: "one-minus-src-alpha",
                operation: "add",
              },
              alpha: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
                operation: "add",
              },
            },
          },
        ],
      },
      primitive: { topology: "triangle-strip" },
    });
  }),
);

/** The same contract for the RAW preview, which draws without blending. */
export const rawRenderPipelineAtom = make((get) =>
  Effect.gen(function* () {
    const device = yield* get.result(gpuDeviceAtom);
    const format = yield* get.result(gpuFormatAtom);
    if (!device || !format) return null;

    const shaderModule = device.createShaderModule({ code: rafShader });
    return device.createRenderPipeline({
      layout: "auto",
      vertex: { module: shaderModule, entryPoint: "vs_main" },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format }],
      },
      primitive: { topology: "triangle-strip" },
    });
  }),
);
