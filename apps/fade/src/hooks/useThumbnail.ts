import type { FileItem } from '../lib/fs'
import { RafDataView } from '@shikanime-studio/medialab'
import { useGpuDevice } from '@shikanime-studio/medialab/hooks'
import { useSuspenseQuery } from '@tanstack/react-query'
import { fileTypeFromBlob } from 'file-type'
import { fileHandleKey } from '../lib/queryKey'
import thumbnailShader from '../shaders/thumbnail.wgsl?raw'

function useThumbnailPipeline(device: GPUDevice | null) {
  return useSuspenseQuery({
    queryKey: ['thumbnail-pipeline', device],
    queryFn: () => {
      if (!device)
        return null

      const shaderModule = device.createShaderModule({
        code: thumbnailShader,
      })

      return device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vs_main',
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fs_main',
          targets: [
            {
              format: 'rgba8unorm',
            },
          ],
        },
        primitive: {
          topology: 'triangle-strip',
        },
      })
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export function useThumbnail(
  fileItem: FileItem | null,
  width = 256,
  height = 256,
  quality = 1.0,
) {
  const { data: device } = useGpuDevice()
  const pipeline = useThumbnailPipeline(device)
  const handle = fileItem?.handle ?? null
  const mimeType = fileItem?.mimeType ?? null

  return useSuspenseQuery({
    queryKey: [
      'thumbnail',
      fileHandleKey(handle),
      mimeType,
      width,
      height,
      quality,
      device,
      pipeline.data,
    ],
    queryFn: async () => {
      if (!device || !pipeline.data || !handle)
        return null

      const file = await handle.getFile()

      let blob: Blob = file
      const detected = !mimeType ? await fileTypeFromBlob(file) : null
      const effectiveType = mimeType ?? detected?.mime ?? file.type ?? ''

      if (effectiveType === 'image/x-fujifilm-raf') {
        const buffer = await file.arrayBuffer()
        const view = new RafDataView(buffer)
        const jpgView = view.getJpegImage()
        if (!jpgView)
          return null
        blob = new Blob([jpgView as unknown as BlobPart], { type: 'image/jpeg' })
      }
      else {
        if (!effectiveType.startsWith('image/'))
          return null
        if (!file.type && effectiveType) {
          blob = file.slice(0, file.size, effectiveType)
        }
      }

      let bitmap: ImageBitmap | null = null
      let srcTexture: GPUTexture | null = null
      let dstTexture: GPUTexture | null = null
      let uniformBuffer: GPUBuffer | null = null
      let readBuffer: GPUBuffer | null = null

      const bytesPerPixel = 4
      const unpaddedBytesPerRow = width * bytesPerPixel
      const align = 256
      const paddedBytesPerRow = Math.ceil(unpaddedBytesPerRow / align) * align
      const bufferSize = paddedBytesPerRow * height

      try {
        try {
          bitmap = await createImageBitmap(blob)
        }
        catch {
          return null
        }
        if (bitmap.width <= 0 || bitmap.height <= 0)
          return null

        srcTexture = device.createTexture({
          size: [bitmap.width, bitmap.height],
          format: 'rgba8unorm',
          usage:
            GPUTextureUsage.TEXTURE_BINDING
            | GPUTextureUsage.COPY_DST
            | GPUTextureUsage.RENDER_ATTACHMENT,
        })

        device.queue.copyExternalImageToTexture(
          { source: bitmap },
          { texture: srcTexture },
          [bitmap.width, bitmap.height],
        )

        dstTexture = device.createTexture({
          size: [width, height],
          format: 'rgba8unorm',
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        })

        const ratioW = width / bitmap.width
        const ratioH = height / bitmap.height
        const scale = Math.max(ratioW, ratioH)

        const uvScaleX = ratioW / scale
        const uvScaleY = ratioH / scale
        const uvOffsetX = (1.0 - uvScaleX) / 2.0
        const uvOffsetY = (1.0 - uvScaleY) / 2.0

        const uniformData = new Float32Array([
          uvScaleX,
          uvScaleY,
          uvOffsetX,
          uvOffsetY,
        ])

        uniformBuffer = device.createBuffer({
          size: uniformData.byteLength,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        device.queue.writeBuffer(uniformBuffer, 0, uniformData)

        readBuffer = device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        })

        const bindGroup = device.createBindGroup({
          layout: pipeline.data.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear',
              }),
            },
            { binding: 1, resource: srcTexture.createView() },
            { binding: 2, resource: { buffer: uniformBuffer } },
          ],
        })

        const commandEncoder = device.createCommandEncoder()

        const pass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: dstTexture.createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        })

        pass.setPipeline(pipeline.data)
        pass.setBindGroup(0, bindGroup)
        pass.draw(4)
        pass.end()

        commandEncoder.copyTextureToBuffer(
          { texture: dstTexture },
          { buffer: readBuffer, bytesPerRow: paddedBytesPerRow },
          [width, height],
        )

        device.queue.submit([commandEncoder.finish()])

        await readBuffer.mapAsync(GPUMapMode.READ)

        const mappedRange = readBuffer.getMappedRange()
        const mappedData = new Uint8Array(mappedRange)

        const imageData = new ImageData(width, height)
        for (let y = 0; y < height; y++) {
          const row = mappedData.subarray(
            y * paddedBytesPerRow,
            y * paddedBytesPerRow + unpaddedBytesPerRow,
          )
          imageData.data.set(row, y * unpaddedBytesPerRow)
        }

        readBuffer.unmap()

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx)
          return null

        ctx.putImageData(imageData, 0, 0)
        return canvas.toDataURL('image/webp', quality)
      }
      finally {
        bitmap?.close()
        srcTexture?.destroy()
        dstTexture?.destroy()
        uniformBuffer?.destroy()
        readBuffer?.destroy()
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}
