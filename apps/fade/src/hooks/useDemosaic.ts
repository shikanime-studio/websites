import { useEffect, useMemo } from "react";
import rafShader from "../shaders/raf.wgsl?raw";
import { useGPU } from "./useGPU";

function useDemosaicPipeline() {
  const { device, format } = useGPU();

  return useMemo(() => {
    if (!device || !format) return null;

    const shaderModule = device.createShaderModule({
      code: rafShader,
    });

    return device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [
          {
            format,
          },
        ],
      },
      primitive: {
        topology: "triangle-strip",
      },
    });
  }, [device, format]);
}

function useDemosaicBindGroup(
  pipeline: GPURenderPipeline | null,
  width: number,
  height: number,
  data: ArrayBufferLike,
) {
  const { device } = useGPU();

  return useMemo(() => {
    if (!device || !pipeline || width <= 0 || height <= 0) return null;

    // Create texture for raw data
    const texture = device.createTexture({
      size: [width, height],
      format: "r16uint",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    // Upload data
    device.queue.writeTexture(
      { texture },
      data,
      { bytesPerRow: width * 2 },
      { width, height },
    );

    return device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: texture.createView(),
        },
      ],
    });
  }, [device, pipeline, width, height, data]);
}

export function useDemosaic(
  context: GPUCanvasContext | null,
  width: number,
  height: number,
  data: ArrayBufferLike,
) {
  const { device, format } = useGPU();
  const pipeline = useDemosaicPipeline();
  const bindGroup = useDemosaicBindGroup(pipeline, width, height, data);

  useEffect(() => {
    if (!device || !context || !format || !pipeline || !bindGroup) return;

    context.configure({
      device,
      format,
      alphaMode: "premultiplied",
    });

    // Render
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.draw(4);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
  }, [device, context, format, pipeline, bindGroup]);
}
