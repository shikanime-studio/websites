import { useGpuDevice } from '@shikanime-studio/medialab/hooks/gpu'
import { retryDelay } from '@shikanime-studio/medialab/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
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

export function useHistogram(image: HTMLImageElement | null) {
  const { device } = useGpuDevice()
  const computePipeline = useHistogramComputePipeline(device)
  const normalizePipeline = useHistogramNormalizePipeline(device)

  const src = image ? (image.currentSrc || image.src) : null
  const width = image?.naturalWidth ?? 0
  const height = image?.naturalHeight ?? 0

  return useSuspenseQuery({
    queryKey: [
      'histogram',
      device,
      src,
      width,
      height,
      computePipeline.data,
      normalizePipeline.data,
    ],
    queryFn: async () => {
      if (!device || !src || width <= 0 || height <= 0)
        return null
      if (!computePipeline.data || !normalizePipeline.data)
        return null

      let bitmap: ImageBitmap | null = null
      let texture: GPUTexture | null = null
      let storageBuffer: GPUBuffer | null = null
      let normalizedBuffer: GPUBuffer | null = null
      let readBuffer: GPUBuffer | null = null

      const bufferSize = 256 * 3 * 4

      try {
        const response = await fetch(src)
        const blob = await response.blob()
        try {
          bitmap = await createImageBitmap(blob)
        }
        catch {
          return null
        }
        if (bitmap.width <= 0 || bitmap.height <= 0)
          return null

        texture = device.createTexture({
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

        storageBuffer = device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        })

        normalizedBuffer = device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        })

        readBuffer = device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        })

        const bindGroupCompute = device.createBindGroup({
          layout: computePipeline.data.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: texture.createView() },
            { binding: 1, resource: { buffer: storageBuffer } },
          ],
        })

        const bindGroupNormalize = device.createBindGroup({
          layout: normalizePipeline.data.getBindGroupLayout(0),
          entries: [
            { binding: 1, resource: { buffer: storageBuffer } },
            { binding: 2, resource: { buffer: normalizedBuffer } },
          ],
        })

        const commandEncoder = device.createCommandEncoder()

        const pass1 = commandEncoder.beginComputePass()
        pass1.setPipeline(computePipeline.data)
        pass1.setBindGroup(0, bindGroupCompute)
        pass1.dispatchWorkgroups(
          Math.ceil(bitmap.width / 16),
          Math.ceil(bitmap.height / 16),
        )
        pass1.end()

        const pass2 = commandEncoder.beginComputePass()
        pass2.setPipeline(normalizePipeline.data)
        pass2.setBindGroup(0, bindGroupNormalize)
        pass2.dispatchWorkgroups(1)
        pass2.end()

        commandEncoder.copyBufferToBuffer(
          normalizedBuffer,
          0,
          readBuffer,
          0,
          bufferSize,
        )

        device.queue.submit([commandEncoder.finish()])

        await readBuffer.mapAsync(GPUMapMode.READ)

        const arrayBuffer = readBuffer.getMappedRange()
        const result = new Float32Array(arrayBuffer)

        const r = [...result.slice(0, 256)]
        const g = [...result.slice(256, 512)]
        const b = [...result.slice(512, 768)]

        readBuffer.unmap()

        return { r, g, b }
      }
      finally {
        bitmap?.close()
        storageBuffer?.destroy()
        normalizedBuffer?.destroy()
        readBuffer?.destroy()
        texture?.destroy()
      }
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}
