import rafShader from "./raf.wgsl?raw";

import type { DemosaicResult } from "../demosaic";
import type { RawImageDataView } from "../raw";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface RenderResources {
  device: any;
  pipeline: any;
  uniformBuffer: any;
  sampler: any;
  texture: any;
  stagingBuffer: any;
  commandEncoder: any;
}

let resources: RenderResources | null = null;
let textureWidth = 0;
let textureHeight = 0;

function createResources(device: any, width: number, height: number): RenderResources {
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({ code: rafShader }),
      entryPoint: "vs_main",
    },
    fragment: {
      module: device.createShaderModule({ code: rafShader }),
      entryPoint: "fs_main",
      targets: [{ format: "bgra8unorm" }],
    },
    primitive: { topology: "triangle-strip" },
  });

  const uniformBuffer = device.createBuffer({
    size: 8 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  });

  const texture = device.createTexture({
    size: { width, height },
    format: "bgra8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const stagingBuffer = device.createBuffer({
    size: width * height * 4,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  return {
    device,
    pipeline,
    uniformBuffer,
    sampler,
    texture,
    stagingBuffer,
    commandEncoder: null as unknown as any,
  };
}

async function ensureResources(device: any, width: number, height: number): Promise<RenderResources> {
  if (resources && textureWidth === width && textureHeight === height) {
    return resources;
  }

  if (resources) {
    resources = null;
  }

  textureWidth = width;
  textureHeight = height;
  resources = createResources(device, width, height);

  return resources;
}

// Full-screen quad vertex data (two triangles via triangle-strip)
const VERTICES = new Float32Array([
  -1, -1,
  1, -1,
  -1, 1,
  1, 1,
]);

export async function renderDemosaic(
  device: any,
  data: RawImageDataView,
  _demosaicResult: DemosaicResult,
): Promise<Uint8ClampedArray> {
  const width = data.width;
  const height = data.height;

  const res = await ensureResources(device, width, height);

  const uniformData = new Float32Array([
    width,
    height,
    0.0,
    0.0,
    0.0,
    0.0,
  ]);
  device.queue.writeBuffer(res.uniformBuffer, 0, uniformData);

  const rowBytes = width * 2;
  const cfaArray = new Uint8Array(width * height * 2);
  cfaArray.set(new Uint8Array(data.cfaBuffer));
  device.queue.writeTexture(
    { texture: res.texture },
    { data: cfaArray, bytesPerRow: rowBytes },
    { width, height },
  );

  res.commandEncoder = device.createCommandEncoder();

  const textureView = res.texture.createView();
  const bindGroup = device.createBindGroup({
    layout: res.pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: res.uniformBuffer } },
      { binding: 1, resource: res.sampler },
      { binding: 2, resource: textureView },
    ],
  });

  const vertexBuffer = device.createBuffer({
    size: VERTICES.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, VERTICES);

  const renderPass = res.commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: textureView,
      clearValue: { r: 0, g: 0, b: 0, a: 1 },
      loadOp: "load",
      storeOp: "store",
    }],
  });

  renderPass.setPipeline(res.pipeline);
  renderPass.setBindGroup(0, bindGroup);
  renderPass.setVertexBuffer(0, vertexBuffer);
  renderPass.draw(4);
  renderPass.end();

  const readEnc = device.createCommandEncoder();
  readEnc.copyTextureToBuffer(
    { texture: res.texture },
    { buffer: res.stagingBuffer, bytesPerRow: width * 4, rowsPerImage: height },
    { width, height },
  );

  const queue = device.queue;
  queue.submit([res.commandEncoder.finish()]);
  queue.submit([readEnc.finish()]);

  await res.stagingBuffer.mapAsync(GPUMapMode.READ);
  const mapped = new Uint8Array(res.stagingBuffer.getMappedRange());
  const output = new Uint8ClampedArray(mapped);
  res.stagingBuffer.unmap();

  return output;
}
