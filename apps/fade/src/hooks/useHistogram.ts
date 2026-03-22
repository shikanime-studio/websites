import { useGpuDevice } from '@shikanime-studio/medialab/hooks/gpu'
import { retryDelay } from '@shikanime-studio/medialab/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import histogramShader from '../shaders/histogram.wgsl?raw'

export interface Bins {
  r: Array<number>
  g: Array<number>
  b: Array<number>
}

function useHistogramComputePipeline(device: GPUDevice | null) {
  return useSuspenseQuery({
    queryKey: ['histogram-compute-pipeline', device],
    queryFn: () => {
      if (!device)
        return null

      const shaderModule = device.createShaderModule({
        code: histogramShader,
      })

      return device.createComputePipeline({
        layout: 'auto',
        compute: {
          module: shaderModule,
          entryPoint: 'cs_main',
        },
      })
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}

function useHistogramNormalizePipeline(device: GPUDevice | null) {
  return useSuspenseQuery({
    queryKey: ['histogram-normalize-pipeline', device],
    queryFn: () => {
      if (!device)
        return null

      const shaderModule = device.createShaderModule({
        code: histogramShader,
      })

      return device.createComputePipeline({
        layout: 'auto',
        compute: {
          module: shaderModule,
          entryPoint: 'cs_normalize',
        },
      })
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}

function useHistogramBitmap(src: string | null, width: number, height: number) {
  const result = useSuspenseQuery({
    queryKey: ['histogram-bitmap', src, width, height],
    queryFn: async () => {
      if (!src || width <= 0 || height <= 0)
        return null

      const response = await fetch(src)
      const blob = await response.blob()
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

function useHistogramTexture(device: GPUDevice | null, bitmap: ImageBitmap | null) {
  const result = useSuspenseQuery({
    queryKey: ['histogram-texture', device, bitmap],
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

function useHistogramBuffers(device: GPUDevice | null) {
  const bufferSize = 256 * 3 * 4

  const result = useSuspenseQuery({
    queryKey: ['histogram-buffers', device, bufferSize],
    queryFn: () => {
      if (!device)
        return null

      const storageBuffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      })

      const normalizedBuffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      })

      const readBuffer = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      })

      return {
        bufferSize,
        storageBuffer,
        normalizedBuffer,
        readBuffer,
      }
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })

  useEffect(() => {
    return () => {
      result.data?.storageBuffer.destroy()
      result.data?.normalizedBuffer.destroy()
      result.data?.readBuffer.destroy()
    }
  }, [result.data])

  return result
}

export function useHistogram(image: HTMLImageElement | null) {
  const { device } = useGpuDevice()
  const computePipeline = useHistogramComputePipeline(device)
  const normalizePipeline = useHistogramNormalizePipeline(device)

  const src = image ? (image.currentSrc || image.src) : null
  const width = image?.naturalWidth ?? 0
  const height = image?.naturalHeight ?? 0
  const bitmap = useHistogramBitmap(src, width, height)
  const texture = useHistogramTexture(device, bitmap.data)
  const buffers = useHistogramBuffers(device)

  return useSuspenseQuery({
    queryKey: [
      'histogram',
      device,
      src,
      width,
      height,
      computePipeline.data,
      normalizePipeline.data,
      bitmap.data,
      bitmap.data?.width,
      bitmap.data?.height,
      texture.data,
      buffers.data,
      buffers.data?.bufferSize,
      buffers.data?.storageBuffer,
      buffers.data?.normalizedBuffer,
      buffers.data?.readBuffer,
    ],
    queryFn: async () => {
      if (!device || !src || width <= 0 || height <= 0)
        return null
      if (!computePipeline.data || !normalizePipeline.data)
        return null
      if (!bitmap.data || !texture.data || !buffers.data)
        return null

      const bindGroupCompute = device.createBindGroup({
        layout: computePipeline.data.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: texture.data.createView() },
          { binding: 1, resource: { buffer: buffers.data.storageBuffer } },
        ],
      })

      const bindGroupNormalize = device.createBindGroup({
        layout: normalizePipeline.data.getBindGroupLayout(0),
        entries: [
          { binding: 1, resource: { buffer: buffers.data.storageBuffer } },
          { binding: 2, resource: { buffer: buffers.data.normalizedBuffer } },
        ],
      })

      const commandEncoder = device.createCommandEncoder()

      const pass1 = commandEncoder.beginComputePass()
      pass1.setPipeline(computePipeline.data)
      pass1.setBindGroup(0, bindGroupCompute)
      pass1.dispatchWorkgroups(
        Math.ceil(bitmap.data.width / 16),
        Math.ceil(bitmap.data.height / 16),
      )
      pass1.end()

      const pass2 = commandEncoder.beginComputePass()
      pass2.setPipeline(normalizePipeline.data)
      pass2.setBindGroup(0, bindGroupNormalize)
      pass2.dispatchWorkgroups(1)
      pass2.end()

      commandEncoder.copyBufferToBuffer(
        buffers.data.normalizedBuffer,
        0,
        buffers.data.readBuffer,
        0,
        buffers.data.bufferSize,
      )

      device.queue.submit([commandEncoder.finish()])

      await buffers.data.readBuffer.mapAsync(GPUMapMode.READ)

      const arrayBuffer = buffers.data.readBuffer.getMappedRange()
      const result = new Float32Array(arrayBuffer)

      const r = [...result.slice(0, 256)]
      const g = [...result.slice(256, 512)]
      const b = [...result.slice(512, 768)]

      buffers.data.readBuffer.unmap()

      return { r, g, b }
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}
