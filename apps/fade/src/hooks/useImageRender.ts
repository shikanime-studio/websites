import { useCallback, useEffect, useMemo } from "react";
import imageShader from "../shaders/image.wgsl?raw";
import { useGPU } from "./useGPU";

interface LightingParams {
  exposure: number;
  contrast: number;
  saturation: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  tint: number;
  temperature: number;
  vibrance: number;
  hue: number;
}

function createLightingUniformData(lighting: LightingParams): Array<number> {
  return [
    lighting.exposure,
    lighting.contrast,
    lighting.saturation,
    lighting.vibrance,
    lighting.highlights,
    lighting.shadows,
    lighting.whites,
    lighting.blacks,
    lighting.tint,
    lighting.temperature,
    lighting.hue,
    0,
  ];
}

function createLightingUniformBuffer(device: GPUDevice): GPUBuffer {
  return device.createBuffer({
    size: 48,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
}

function updateLightingUniformBuffer(
  device: GPUDevice,
  buffer: GPUBuffer,
  lighting: LightingParams,
) {
  const uniformData = new Float32Array(createLightingUniformData(lighting));
  device.queue.writeBuffer(buffer, 0, uniformData);
}

function createLightingBindGroup(
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  uniformBuffer: GPUBuffer,
  sourceView: GPUTextureView,
): GPUBindGroup {
  return device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
      {
        binding: 1,
        resource: device.createSampler({
          magFilter: "linear",
          minFilter: "linear",
        }),
      },
      {
        binding: 2,
        resource: sourceView,
      },
    ],
  });
}

function encodeLightingRenderPass(
  pipeline: GPURenderPipeline,
  bindGroup: GPUBindGroup,
  commandEncoder: GPUCommandEncoder,
  destView: GPUTextureView,
  clearValue: GPUColorDict = { r: 0, g: 0, b: 0, a: 0 },
) {
  const pass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: destView,
        clearValue,
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });

  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(4);
  pass.end();
}

function useImagePipeline() {
  const { device, format } = useGPU();

  return useMemo(() => {
    if (!device || !format) return null;

    const shaderModule = device.createShaderModule({
      code: imageShader,
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
      primitive: {
        topology: "triangle-strip",
      },
    });
  }, [device, format]);
}

export function useImageRender(
  context: GPUCanvasContext | null,
  image: HTMLImageElement | null,
  lighting: LightingParams = {
    exposure: 0,
    contrast: 1,
    saturation: 1,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    tint: 0,
    temperature: 0,
    vibrance: 0,
    hue: 0,
  },
) {
  const { device, format } = useGPU();
  const pipeline = useImagePipeline();

  const texture = useMemo(() => {
    if (!device || !image || !image.complete || image.naturalWidth === 0) {
      return null;
    }

    try {
      const tex = device.createTexture({
        size: [image.naturalWidth, image.naturalHeight],
        format: "rgba8unorm",
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT,
      });

      device.queue.copyExternalImageToTexture(
        { source: image },
        { texture: tex },
        { width: image.naturalWidth, height: image.naturalHeight },
      );

      return tex;
    } catch (e) {
      console.error("Failed to create texture from image:", e);
      return null;
    }
  }, [device, image]);

  const resources = useMemo(() => {
    if (!device || !pipeline || !texture) {
      return null;
    }

    const uniformBuffer = createLightingUniformBuffer(device);
    const bindGroup = createLightingBindGroup(
      device,
      pipeline,
      uniformBuffer,
      texture.createView(),
    );

    return { uniformBuffer, bindGroup };
  }, [device, pipeline, texture]);

  useEffect(() => {
    if (!device || !context || !format) {
      return;
    }

    context.configure({
      device,
      format,
      alphaMode: "premultiplied",
    });
  }, [device, context, format]);

  useEffect(() => {
    if (!device || !context || !pipeline || !texture || !resources) {
      return;
    }

    updateLightingUniformBuffer(device, resources.uniformBuffer, lighting);

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    encodeLightingRenderPass(
      pipeline,
      resources.bindGroup,
      commandEncoder,
      textureView,
    );

    device.queue.submit([commandEncoder.finish()]);
  }, [device, context, pipeline, texture, resources, lighting]);
}

function useImageDownloadPipeline() {
  const { device } = useGPU();

  return useMemo(() => {
    if (!device) return null;

    const shaderModule = device.createShaderModule({
      code: imageShader,
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
            format: "rgba8unorm",
          },
        ],
      },
      primitive: {
        topology: "triangle-strip",
      },
    });
  }, [device]);
}

async function renderImageToImageData(
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  image: HTMLImageElement,
  lighting: LightingParams,
): Promise<ImageData | null> {
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  let srcTexture: GPUTexture | null = null;
  let dstTexture: GPUTexture | null = null;
  let readBuffer: GPUBuffer | null = null;
  let uniformBuffer: GPUBuffer | null = null;

  try {
    srcTexture = device.createTexture({
      size: [width, height],
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.copyExternalImageToTexture(
      { source: image },
      { texture: srcTexture },
      [width, height],
    );

    dstTexture = device.createTexture({
      size: [width, height],
      format: "rgba8unorm",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
    });

    const bytesPerPixel = 4;
    const unpaddedBytesPerRow = width * bytesPerPixel;
    const align = 256;
    const paddedBytesPerRow = Math.ceil(unpaddedBytesPerRow / align) * align;
    const bufferSize = paddedBytesPerRow * height;

    readBuffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    uniformBuffer = createLightingUniformBuffer(device);

    updateLightingUniformBuffer(device, uniformBuffer, lighting);

    const bindGroup = createLightingBindGroup(
      device,
      pipeline,
      uniformBuffer,
      srcTexture.createView(),
    );

    const commandEncoder = device.createCommandEncoder();

    encodeLightingRenderPass(
      pipeline,
      bindGroup,
      commandEncoder,
      dstTexture.createView(),
      { r: 0, g: 0, b: 0, a: 1 },
    );

    commandEncoder.copyTextureToBuffer(
      { texture: dstTexture },
      { buffer: readBuffer, bytesPerRow: paddedBytesPerRow },
      [width, height],
    );

    device.queue.submit([commandEncoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);

    const mappedRange = readBuffer.getMappedRange();
    const mappedData = new Uint8Array(mappedRange);

    const imageData = new ImageData(width, height);
    for (let y = 0; y < height; y++) {
      const row = mappedData.subarray(
        y * paddedBytesPerRow,
        y * paddedBytesPerRow + unpaddedBytesPerRow,
      );
      imageData.data.set(row, y * unpaddedBytesPerRow);
    }

    readBuffer.unmap();

    return imageData;
  } finally {
    srcTexture?.destroy();
    dstTexture?.destroy();
    readBuffer?.destroy();
    uniformBuffer?.destroy();
  }
}

export function useImageDownload(
  image: HTMLImageElement | null,
  lighting: LightingParams,
) {
  const { device } = useGPU();
  const pipeline = useImageDownloadPipeline();

  return useCallback(
    async (fileName?: string) => {
      if (
        !device ||
        !pipeline ||
        !image ||
        !image.complete ||
        image.naturalWidth === 0 ||
        image.naturalHeight === 0
      ) {
        return;
      }

      const imageData = await renderImageToImageData(
        device,
        pipeline,
        image,
        lighting,
      );
      if (!imageData) {
        return;
      }

      const tiffBlob = createTiffBlobFromImageData(imageData);

      const url = URL.createObjectURL(tiffBlob);
      const link = document.createElement("a");
      const baseName =
        fileName ??
        (image.alt && image.alt.trim().length > 0 ? image.alt : "image");
      link.download = baseName.replace(/\.[^/.]+$/, "") + "-edited.tiff";
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    [device, pipeline, image, lighting],
  );
}

function createTiffBlobFromImageData(imageData: ImageData): Blob {
  const width = imageData.width;
  const height = imageData.height;
  const bytesPerPixel = 4;
  const stripByteCount = width * height * bytesPerPixel;
  const bitsPerSampleCount = 4;
  const ifdEntryCount = 9;
  const headerSize = 8;
  const ifdSize = 2 + ifdEntryCount * 12 + 4;
  const bitsPerSampleOffset = headerSize + ifdSize;
  const stripOffset = bitsPerSampleOffset + bitsPerSampleCount * 2;
  const totalSize = stripOffset + stripByteCount;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  let offset = 0;

  view.setUint8(offset, 0x49);
  offset += 1;
  view.setUint8(offset, 0x49);
  offset += 1;
  view.setUint16(offset, 42, true);
  offset += 2;
  view.setUint32(offset, headerSize, true);

  view.setUint16(headerSize, ifdEntryCount, true);

  let entryOffset = headerSize + 2;

  entryOffset = writeIfdEntry(view, entryOffset, 256, 4, 1, width);
  entryOffset = writeIfdEntry(view, entryOffset, 257, 4, 1, height);
  entryOffset = writeIfdEntry(
    view,
    entryOffset,
    258,
    3,
    bitsPerSampleCount,
    bitsPerSampleOffset,
  );
  entryOffset = writeIfdEntry(view, entryOffset, 259, 3, 1, 1);
  entryOffset = writeIfdEntry(view, entryOffset, 262, 3, 1, 2);
  entryOffset = writeIfdEntry(view, entryOffset, 273, 4, 1, stripOffset);
  entryOffset = writeIfdEntry(view, entryOffset, 277, 3, 1, bytesPerPixel);
  entryOffset = writeIfdEntry(view, entryOffset, 278, 4, 1, height);
  writeIfdEntry(view, entryOffset, 279, 4, 1, stripByteCount);

  view.setUint32(headerSize + 2 + ifdEntryCount * 12, 0, true);

  let bitsOffset = bitsPerSampleOffset;
  for (let i = 0; i < bitsPerSampleCount; i++) {
    view.setUint16(bitsOffset, 8, true);
    bitsOffset += 2;
  }

  bytes.set(imageData.data, stripOffset);

  return new Blob([buffer], { type: "image/tiff" });
}

function writeIfdEntry(
  view: DataView,
  offset: number,
  tag: number,
  type: number,
  count: number,
  valueOffset: number,
): number {
  view.setUint16(offset, tag, true);
  view.setUint16(offset + 2, type, true);
  view.setUint32(offset + 4, count, true);
  view.setUint32(offset + 8, valueOffset, true);
  return offset + 12;
}
