import { useEffect } from "react";
import shaderSource from "../shaders/shader.wgsl?raw";

export function useDemosaic(
  device: GPUDevice | null,
  context: GPUCanvasContext | null,
  width: number,
  height: number,
  data: Uint16Array,
  exposure: number,
) {
  useEffect(() => {
    if (!device || !context || width <= 0 || height <= 0) return;

    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format,
      alphaMode: "premultiplied",
    });

    const shaderModule = device.createShaderModule({
      code: shaderSource,
    });

    const pipeline = device.createRenderPipeline({
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

    // Create texture for raw data
    const texture = device.createTexture({
      size: [width, height],
      format: "r16uint",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    // Upload data
    device.queue.writeTexture(
      { texture },
      data as unknown as BufferSource,
      { bytesPerRow: width * 2 },
      { width, height },
    );

    // Create uniform buffer for params
    const paramsBuffer = device.createBuffer({
      size: 4, // 1 float (exposure)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(paramsBuffer, 0, new Float32Array([exposure]));

    // Bind Group
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: texture.createView(),
        },
        {
          binding: 1,
          resource: {
            buffer: paramsBuffer,
          },
        },
      ],
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
  }, [device, context, width, height, data, exposure]);
}
