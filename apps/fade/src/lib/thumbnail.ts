import type { FileItem } from "./fs";

export interface ThumbnailInput {
  device: GPUDevice | null;
  pipeline: GPURenderPipeline | null;
  blob: Blob;
  fileItem: FileItem | null;
  width: number;
  height: number;
  quality: number;
}

/** Renders one frame to a canvas and returns a WebP data URL. */
export async function renderThumbnail({
  device,
  pipeline,
  blob,
  fileItem,
  width,
  height,
  quality,
}: ThumbnailInput) {
      if (
        !device ||
        !pipeline ||
        !blob ||
        (!blob.type.startsWith("image/") &&
          fileItem?.mimeType !== "image/x-fujifilm-raf")
      ) {
        return null;
      }

      let srcTexture: GPUTexture | null = null;
      let dstTexture: GPUTexture | null = null;
      let readBuffer: GPUBuffer | null = null;
      let uniformBuffer: GPUBuffer | null = null;

      try {
        const bitmap = await createImageBitmap(blob);

        const srcWidth = bitmap.width;
        const srcHeight = bitmap.height;

        srcTexture = device.createTexture({
          size: [srcWidth, srcHeight],
          format: "rgba8unorm",
          usage:
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
        });

        device.queue.copyExternalImageToTexture(
          { source: bitmap },
          { texture: srcTexture },
          [srcWidth, srcHeight],
        );

        dstTexture = device.createTexture({
          size: [width, height],
          format: "rgba8unorm",
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });

        const bytesPerPixel = 4;
        const unpaddedBytesPerRow = width * bytesPerPixel;
        const align = 256;
        const paddedBytesPerRow =
          Math.ceil(unpaddedBytesPerRow / align) * align;
        const bufferSize = paddedBytesPerRow * height;

        readBuffer = device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        // Calculate Scale and Offset for "Cover"
        const ratioW = width / srcWidth;
        const ratioH = height / srcHeight;
        const scale = Math.max(ratioW, ratioH);

        const uvScaleX = ratioW / scale;
        const uvScaleY = ratioH / scale;
        const uvOffsetX = (1.0 - uvScaleX) / 2.0;
        const uvOffsetY = (1.0 - uvScaleY) / 2.0;

        const uniformData = new Float32Array([
          uvScaleX,
          uvScaleY,
          uvOffsetX,
          uvOffsetY,
        ]);

        uniformBuffer = device.createBuffer({
          size: uniformData.byteLength,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        const bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: device.createSampler({
                magFilter: "linear",
                minFilter: "linear",
              }),
            },
            { binding: 1, resource: srcTexture.createView() },
            { binding: 2, resource: { buffer: uniformBuffer } },
          ],
        });

        const commandEncoder = device.createCommandEncoder();

        const pass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: dstTexture.createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: "clear",
              storeOp: "store",
            },
          ],
        });

        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.draw(4);
        pass.end();

        commandEncoder.copyTextureToBuffer(
          { texture: dstTexture },
          { buffer: readBuffer, bytesPerRow: paddedBytesPerRow },
          [width, height],
        );

        device.queue.submit([commandEncoder.finish()]);

        await readBuffer.mapAsync(GPUMapMode.READ);

        const mappedRange = readBuffer.getMappedRange();
        const mappedData = new Uint8Array(mappedRange);

        // Convert to ImageData
        const imageData = new ImageData(width, height);
        for (let y = 0; y < height; y++) {
          const row = mappedData.subarray(
            y * paddedBytesPerRow,
            y * paddedBytesPerRow + unpaddedBytesPerRow,
          );
          imageData.data.set(row, y * unpaddedBytesPerRow);
        }

        readBuffer.unmap();

        // Convert to Blob/DataURL using Canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL("image/webp", quality);
      } finally {
        srcTexture?.destroy();
        dstTexture?.destroy();
        readBuffer?.destroy();
        uniformBuffer?.destroy();
      }
}
