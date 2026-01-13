import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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

export function useDemosaic(
  context: GPUCanvasContext | null,
  width: number,
  height: number,
  data: ArrayBufferLike,
) {
  const { device, format } = useGPU();
  const pipeline = useDemosaicPipeline();

  useSuspenseQuery({
    queryKey: [
      "demosaic",
      width,
      height,
      !!context,
      !!device,
      !!format,
      !!pipeline,
    ],
    queryFn: async () => {
      if (
        !device ||
        !context ||
        !format ||
        !pipeline ||
        width <= 0 ||
        height <= 0
      ) {
        return null;
      }

      let texture: GPUTexture | null = null;

      try {
        // Create texture for raw data
        texture = device.createTexture({
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

        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: texture.createView(),
            },
          ],
        });

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

        const passEncoder =
          commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.draw(4);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);

        await device.queue.onSubmittedWorkDone();

        return true;
      } finally {
        texture?.destroy();
      }
    },
    staleTime: Infinity,
  });
}
