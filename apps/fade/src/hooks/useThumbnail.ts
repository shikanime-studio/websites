import type { FileItem } from '../lib/fs'
import { useGpuDevice } from '@shikanime-studio/medialab/hooks/gpu'
import { retryDelay } from '@shikanime-studio/medialab/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import thumbnailShader from '../shaders/thumbnail.wgsl?raw'
import { usePreview } from './usePreview'

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
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}

function useThumbnailBitmap(blob: Blob | null) {
  const result = useSuspenseQuery({
    queryKey: ['thumbnail-bitmap', blob],
    queryFn: async () => {
      if (!blob)
        return null

      return await createImageBitmap(blob)
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })

  useEffect(() => {
    return () => {
      result.data?.close()
    }
  }, [result.data])

  return result
}

function useThumbnailSrcTexture(device: GPUDevice | null, bitmap: ImageBitmap | null) {
  const result = useSuspenseQuery({
    queryKey: ['thumbnail-src-texture', device, bitmap],
    queryFn: () => {
      if (!device || !bitmap)
        return null

      const texture = device.createTexture({
        size: [bitmap.width, bitmap.height],
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING
          | GPUTextureUsage.COPY_DST
          | GPUTextureUsage.RENDER_ATTACHMENT,
      })

      device.queue.copyExternalImageToTexture(
        { source: bitmap },
        { texture },
        [bitmap.width, bitmap.height],
      )

      return texture
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })

  useEffect(() => {
    return () => {
      result.data?.destroy()
    }
  }, [result.data])

  return result
}

function useThumbnailDstTexture(device: GPUDevice | null, width: number, height: number) {
  const result = useSuspenseQuery({
    queryKey: ['thumbnail-dst-texture', device, width, height],
    queryFn: () => {
      if (!device)
        return null

      return device.createTexture({
        size: [width, height],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
      })
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })

  useEffect(() => {
    return () => {
      result.data?.destroy()
    }
  }, [result.data])

  return result
}

function useThumbnailReadBuffer(device: GPUDevice | null, width: number, height: number) {
  const bytesPerPixel = 4
  const unpaddedBytesPerRow = width * bytesPerPixel
  const align = 256
  const paddedBytesPerRow = Math.ceil(unpaddedBytesPerRow / align) * align
  const bufferSize = paddedBytesPerRow * height

  const result = useSuspenseQuery({
    queryKey: [
      'thumbnail-read-buffer',
      device,
      width,
      height,
      bufferSize,
      paddedBytesPerRow,
      unpaddedBytesPerRow,
    ],
    queryFn: () => {
      if (!device)
        return null

      const buffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      })

      return {
        buffer,
        paddedBytesPerRow,
        unpaddedBytesPerRow,
      }
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })

  useEffect(() => {
    return () => {
      result.data?.buffer.destroy()
    }
  }, [result.data])

  return result
}

function useThumbnailUniformBuffer(
  device: GPUDevice | null,
  width: number,
  height: number,
  srcWidth: number,
  srcHeight: number,
) {
  const result = useSuspenseQuery({
    queryKey: ['thumbnail-uniform-buffer', device, width, height, srcWidth, srcHeight],
    queryFn: () => {
      if (!device || srcWidth <= 0 || srcHeight <= 0)
        return null

      const ratioW = width / srcWidth
      const ratioH = height / srcHeight
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

      const buffer = device.createBuffer({
        size: uniformData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      device.queue.writeBuffer(buffer, 0, uniformData)

      return buffer
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })

  useEffect(() => {
    return () => {
      result.data?.destroy()
    }
  }, [result.data])

  return result
}

export function useThumbnail(
  fileItem: FileItem | null,
  width = 256,
  height = 256,
  quality = 1.0,
) {
  const { device } = useGpuDevice()
  const { blob } = usePreview(fileItem)
  const pipeline = useThumbnailPipeline(device)
  const fileName = fileItem?.handle.name ?? null
  const mimeType = fileItem?.mimeType ?? null
  const blobType = blob?.type ?? null
  const blobSize = blob?.size ?? 0

  const isRenderable
    = !!blob
      && (blob.type.startsWith('image/') || mimeType === 'image/x-fujifilm-raf')
      && !!device
      && !!pipeline.data

  const bitmap = useThumbnailBitmap(isRenderable ? blob : null)
  const srcTexture = useThumbnailSrcTexture(device, bitmap.data)
  const dstTexture = useThumbnailDstTexture(device, width, height)
  const readBuffer = useThumbnailReadBuffer(device, width, height)
  const uniformBuffer = useThumbnailUniformBuffer(
    device,
    width,
    height,
    bitmap.data?.width ?? 0,
    bitmap.data?.height ?? 0,
  )

  return useSuspenseQuery({
    queryKey: [
      'thumbnail',
      fileName,
      mimeType,
      blob,
      blobType,
      blobSize,
      width,
      height,
      quality,
      device,
      pipeline.data,
      srcTexture.data,
      dstTexture.data,
      readBuffer.data,
      readBuffer.data?.buffer,
      readBuffer.data?.paddedBytesPerRow,
      readBuffer.data?.unpaddedBytesPerRow,
      uniformBuffer.data,
    ],
    queryFn: async () => {
      if (!device || !pipeline.data || !blob)
        return null
      if (!blob.type.startsWith('image/') && mimeType !== 'image/x-fujifilm-raf')
        return null
      if (!srcTexture.data || !dstTexture.data || !readBuffer.data || !uniformBuffer.data)
        return null

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
          { binding: 1, resource: srcTexture.data.createView() },
          { binding: 2, resource: { buffer: uniformBuffer.data } },
        ],
      })

      const commandEncoder = device.createCommandEncoder()

      const pass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: dstTexture.data.createView(),
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
        { texture: dstTexture.data },
        { buffer: readBuffer.data.buffer, bytesPerRow: readBuffer.data.paddedBytesPerRow },
        [width, height],
      )

      device.queue.submit([commandEncoder.finish()])

      await readBuffer.data.buffer.mapAsync(GPUMapMode.READ)

      const mappedRange = readBuffer.data.buffer.getMappedRange()
      const mappedData = new Uint8Array(mappedRange)

      const imageData = new ImageData(width, height)
      for (let y = 0; y < height; y++) {
        const row = mappedData.subarray(
          y * readBuffer.data.paddedBytesPerRow,
          y * readBuffer.data.paddedBytesPerRow + readBuffer.data.unpaddedBytesPerRow,
        )
        imageData.data.set(row, y * readBuffer.data.unpaddedBytesPerRow)
      }

      readBuffer.data.buffer.unmap()

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx)
        return null

      ctx.putImageData(imageData, 0, 0)
      return canvas.toDataURL('image/webp', quality)
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}
