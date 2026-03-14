import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import histogramShader from '../shaders/histogram.wgsl?raw'
import { useGPU } from './useGPU'

export interface Bins {
  r: Array<number>
  g: Array<number>
  b: Array<number>
}

function useHistogramComputePipeline() {
  const { device } = useGPU()

  return useMemo(() => {
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
  }, [device])
}

function useHistogramNormalizePipeline() {
  const { device } = useGPU()

  return useMemo(() => {
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
  }, [device])
}

export function useHistogram(image: HTMLImageElement | null) {
  const { device } = useGPU()
  const computePipeline = useHistogramComputePipeline()
  const normalizePipeline = useHistogramNormalizePipeline()

  const imageKey = image
    ? {
        src: image.currentSrc || image.src,
        width: image.naturalWidth,
        height: image.naturalHeight,
      }
    : null

  const { data } = useSuspenseQuery({
    queryKey: [
      'histogram',
      imageKey,
      !!device,
      !!computePipeline,
      !!normalizePipeline,
    ],
    queryFn: async () => {
      if (!device || !computePipeline || !normalizePipeline || !imageKey)
        return null
      const response = await fetch(imageKey.src)
      const blob = await response.blob()
      const imageBitmap = await createImageBitmap(blob)

      const width = imageBitmap.width
      const height = imageBitmap.height

      let texture: GPUTexture | null = null
      let storageBuffer: GPUBuffer | null = null
      let normalizedBuffer: GPUBuffer | null = null
      let readBuffer: GPUBuffer | null = null

      try {
        texture = device.createTexture({
          size: [width, height],
          format: 'rgba8unorm',
          usage:
            GPUTextureUsage.TEXTURE_BINDING
            | GPUTextureUsage.COPY_DST
            | GPUTextureUsage.RENDER_ATTACHMENT,
        })

        device.queue.copyExternalImageToTexture(
          { source: imageBitmap },
          { texture },
          [width, height],
        )

        const bufferSize = 256 * 3 * 4

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
          layout: computePipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: texture.createView() },
            { binding: 1, resource: { buffer: storageBuffer } },
          ],
        })

        const bindGroupNormalize = device.createBindGroup({
          layout: normalizePipeline.getBindGroupLayout(0),
          entries: [
            { binding: 1, resource: { buffer: storageBuffer } },
            { binding: 2, resource: { buffer: normalizedBuffer } },
          ],
        })

        const commandEncoder = device.createCommandEncoder()

        const pass1 = commandEncoder.beginComputePass()
        pass1.setPipeline(computePipeline)
        pass1.setBindGroup(0, bindGroupCompute)
        pass1.dispatchWorkgroups(Math.ceil(width / 16), Math.ceil(height / 16))
        pass1.end()

        const pass2 = commandEncoder.beginComputePass()
        pass2.setPipeline(normalizePipeline)
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
        imageBitmap.close()
        if (storageBuffer)
          storageBuffer.destroy()
        if (normalizedBuffer)
          normalizedBuffer.destroy()
        if (readBuffer)
          readBuffer.destroy()
        if (texture)
          texture.destroy()
      }
    },
    staleTime: Infinity,
  })

  return data
}
