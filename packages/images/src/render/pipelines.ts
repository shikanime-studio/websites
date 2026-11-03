import histogramShader from "./shaders/histogram.wgsl?raw";
import imageShader from "./shaders/image.wgsl?raw";
import rafShader from "./shaders/raf.wgsl?raw";
import thumbnailShader from "./shaders/thumbnail.wgsl?raw";

/**
 * Pipeline construction, without any state or lifecycle: hand it a device (and
 * a swap-chain format where the shader needs one) and it returns the pipeline.
 * Owning when to build, cache or drop them is the caller's business.
 */

export function createThumbnailPipeline(
  device: GPUDevice,
): GPURenderPipeline {
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
}

export function createHistogramComputePipeline(
  device: GPUDevice,
): GPUComputePipeline {
  const shaderModule = device.createShaderModule({ code: histogramShader });
  return device.createComputePipeline({
    layout: "auto",
    compute: { module: shaderModule, entryPoint: "cs_main" },
  });
}

export function createHistogramNormalizePipeline(
  device: GPUDevice,
): GPUComputePipeline {
  const shaderModule = device.createShaderModule({ code: histogramShader });
  return device.createComputePipeline({
    layout: "auto",
    compute: { module: shaderModule, entryPoint: "cs_normalize" },
  });
}

/** Preview pipeline; blending keeps the checkerboard behind transparent pixels. */
export function createImagePipeline(
  device: GPUDevice,
  format: GPUTextureFormat,
): GPURenderPipeline {
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
}

/** RAW preview pipeline; no blending, the frame fills the canvas. */
export function createRawPipeline(
  device: GPUDevice,
  format: GPUTextureFormat,
): GPURenderPipeline {
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
}
