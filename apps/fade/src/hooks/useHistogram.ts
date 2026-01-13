import { useEffect, useMemo, useState } from "react";
import histogramShader from "../shaders/histogram.wgsl?raw";
import { useGPU } from "./useGPU";

interface Bins {
  r: Array<number>;
  g: Array<number>;
  b: Array<number>;
}

function useHistogramPipeline() {
  const { device } = useGPU();

  return useMemo(() => {
    if (!device) return null;

    const shaderModule = device.createShaderModule({
      code: histogramShader,
    });

    const computePipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module: shaderModule,
        entryPoint: "cs_main",
      },
    });

    const normalizePipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module: shaderModule,
        entryPoint: "cs_normalize",
      },
    });

    return { computePipeline, normalizePipeline };
  }, [device]);
}

function useHistogramBindGroup(
  pipelines: {
    computePipeline: GPUComputePipeline;
    normalizePipeline: GPUComputePipeline;
  } | null,
  image: HTMLImageElement | null,
) {
  const { device } = useGPU();

  return useMemo(() => {
    if (!device || !pipelines || !image) return null;

    const { computePipeline, normalizePipeline } = pipelines;
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    if (width === 0 || height === 0) return null;

    const texture = device.createTexture({
      size: [width, height],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.copyExternalImageToTexture({ source: image }, { texture }, [
      width,
      height,
    ]);

    const bufferSize = 256 * 3 * 4;

    const storageBuffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const normalizedBuffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const readBuffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    const bindGroupCompute = device.createBindGroup({
      layout: computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: texture.createView() },
        { binding: 1, resource: { buffer: storageBuffer } },
      ],
    });

    const bindGroupNormalize = device.createBindGroup({
      layout: normalizePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 1, resource: { buffer: storageBuffer } },
        { binding: 2, resource: { buffer: normalizedBuffer } },
      ],
    });

    return {
      bindGroupCompute,
      bindGroupNormalize,
      storageBuffer,
      normalizedBuffer,
      readBuffer,
      texture,
      width,
      height,
      bufferSize,
    };
  }, [device, pipelines, image]);
}

export function useHistogram(image: HTMLImageElement | null) {
  const { device } = useGPU();
  const pipelines = useHistogramPipeline();
  const resources = useHistogramBindGroup(pipelines, image);
  const [data, setData] = useState<Bins | null>(null);

  useEffect(() => {
    if (!device || !pipelines || !resources) return;

    const { computePipeline, normalizePipeline } = pipelines;
    const {
      bindGroupCompute,
      bindGroupNormalize,
      storageBuffer,
      normalizedBuffer,
      readBuffer,
      texture,
      width,
      height,
      bufferSize,
    } = resources;

    const compute = async () => {
      const commandEncoder = device.createCommandEncoder();

      const pass1 = commandEncoder.beginComputePass();
      pass1.setPipeline(computePipeline);
      pass1.setBindGroup(0, bindGroupCompute);
      pass1.dispatchWorkgroups(Math.ceil(width / 16), Math.ceil(height / 16));
      pass1.end();

      const pass2 = commandEncoder.beginComputePass();
      pass2.setPipeline(normalizePipeline);
      pass2.setBindGroup(0, bindGroupNormalize);
      pass2.dispatchWorkgroups(1);
      pass2.end();

      commandEncoder.copyBufferToBuffer(
        normalizedBuffer,
        0,
        readBuffer,
        0,
        bufferSize,
      );

      device.queue.submit([commandEncoder.finish()]);

      await readBuffer.mapAsync(GPUMapMode.READ);

      const arrayBuffer = readBuffer.getMappedRange();
      const result = new Float32Array(arrayBuffer);

      const r = Array.from(result.slice(0, 256));
      const g = Array.from(result.slice(256, 512));
      const b = Array.from(result.slice(512, 768));

      readBuffer.unmap();

      setData({
        r,
        g,
        b,
      });
    };

    void compute();

    return () => {
      storageBuffer.destroy();
      normalizedBuffer.destroy();
      readBuffer.destroy();
      texture.destroy();
    };
  }, [device, pipelines, resources]);

  return data;
}
