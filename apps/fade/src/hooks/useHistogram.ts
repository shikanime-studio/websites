import { useGpuDevice } from '@shikanime-studio/medialab/hooks/gpu'
import { retryDelay } from '@shikanime-studio/medialab/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import histogramShader from '../shaders/histogram.wgsl?raw'

export interface Bins {
  r: Array<number>
  g: Array<number>
  b: Array<number>
}

function useHistogramComputePipeline() {
  const device = useGpuDevice()

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

function useHistogramNormalizePipeline() {
  const device = useGpuDevice()

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

export function useHistogram(file?: File) {
  const device = useGpuDevice()
  const computePipeline = useHistogramComputePipeline()
  const normalizePipeline = useHistogramNormalizePipeline()
  const fileKey = file
    ? `${file.name}:${file.size.toString()}:${file.lastModified.toString()}:${file.type}`
    : undefined

  return useSuspenseQuery({
    queryKey: [
      'histogram',
      device,
      fileKey,
      file,
      computePipeline.data,
      normalizePipeline.data,
    ],
    queryFn: async (): Promise<Bins | null> => {
      if (!device || !file)
        return null
      if (!computePipeline.data || !normalizePipeline.data)
        return null

      let bitmap: ImageBitmap | undefined
      let texture: GPUTexture | undefined
      let storageBuffer: GPUBuffer | undefined
      let normalizedBuffer: GPUBuffer | undefined
      let readBuffer: GPUBuffer | undefined

      const bufferSize = 256 * 3 * 4

      try {
        try {
          bitmap = await createImageBitmap(file)
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
