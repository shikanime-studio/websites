/// <reference types="@webgpu/types" />
import resizeShader from "../shaders/resize.wgsl?raw";


export function createResizeContext(device: GPUDevice): ResizeContext {
  const shaderModule = device.createShaderModule({
    code: resizeShader,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: { type: "filtering" },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        texture: { sampleType: "float" },
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout,
    vertex: {
      module: shaderModule,
      entryPoint: "vs_main",
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fs_main",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
  });

  return new ResizeContext(device, pipeline, sampler, bindGroupLayout);
}

export class ResizeContext {
  constructor(
    private device: GPUDevice,
    private pipeline: GPURenderPipeline,
    private sampler: GPUSampler,
    private bindGroupLayout: GPUBindGroupLayout,
  ) {}

  async run(
    bitmap: ImageBitmap,
    width: number,
    height: number,
    quality = 0.8,
  ): Promise<Blob | null> {
    try {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext("webgpu");
      if (!context) return null;

      const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

      context.configure({
        device: this.device,
        format: presentationFormat,
        alphaMode: "premultiplied",
      });

      const texture = this.device.createTexture({
        size: [bitmap.width, bitmap.height],
        format: "rgba8unorm",
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT,
      });

      this.device.queue.copyExternalImageToTexture(
        { source: bitmap },
        { texture },
        [bitmap.width, bitmap.height],
      );

      const bindGroup = this.device.createBindGroup({
        layout: this.bindGroupLayout,
        entries: [
          { binding: 0, resource: this.sampler },
          { binding: 1, resource: texture.createView() },
        ],
      });

      const commandEncoder = this.device.createCommandEncoder();
      const textureView = context.getCurrentTexture().createView();

      const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });

      passEncoder.setPipeline(this.pipeline);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.draw(6);
      passEncoder.end();

      this.device.queue.submit([commandEncoder.finish()]);

      await this.device.queue.onSubmittedWorkDone();

      texture.destroy();

      return await canvas.convertToBlob({ type: "image/webp", quality });
    } catch (e) {
      console.error("WebGPU resize failed:", e);
      return null;
    }
  }
}
