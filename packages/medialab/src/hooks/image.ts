import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import imageShader from '../shaders/image.wgsl?raw'
import { useGpuDevice, useGpuFormat } from './gpu'
import { retryDelay } from './utils'

export interface LightingParams {
  exposure: number
  contrast: number
  saturation: number
  vibrance: number
  highlights: number
  shadows: number
  whites: number
  blacks: number
  tint: number
  temperature: number
  hue: number
}

export interface RendererOptions {
  lighting?: Partial<LightingParams>
}

function useImagePipeline() {
  const device = useGpuDevice()
  const format = useGpuFormat()

  return useSuspenseQuery({
    queryKey: ['image-pipeline', device, format],
    queryFn: () => {
      if (!device || !format)
        return null

      const shaderModule = device.createShaderModule({
        code: imageShader,
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
              format,
              blend: {
                color: {
                  srcFactor: 'src-alpha',
                  dstFactor: 'one-minus-src-alpha',
                  operation: 'add',
                },
                alpha: {
                  srcFactor: 'one',
                  dstFactor: 'one-minus-src-alpha',
                  operation: 'add',
                },
              },
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

function useImageTexture(bitmap?: ImageBitmap) {
  const device = useGpuDevice()

  const result = useSuspenseQuery({
    queryKey: [
      'image-texture',
      device,
      bitmap,
      bitmap?.width,
      bitmap?.height,
    ],
    queryFn: async ({ queryKey }) => {
      const device = queryKey[1] as GPUDevice | null
      const bitmap = queryKey[2] as ImageBitmap | null | undefined
      if (!device || !bitmap)
        return null

      const tex = device.createTexture({
        size: [bitmap.width, bitmap.height],
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING
          | GPUTextureUsage.COPY_DST
          | GPUTextureUsage.RENDER_ATTACHMENT,
      })

      device.queue.copyExternalImageToTexture(
        { source: bitmap },
        { texture: tex },
        [bitmap.width, bitmap.height],
      )

      return tex
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

function useImageUniformBuffer(device: GPUDevice | null) {
  const result = useSuspenseQuery({
    queryKey: ['image-uniform-buffer', device],
    queryFn: () => {
      if (!device)
        return null

      return device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
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

export function useImageRender(
  canvasId: string,
  bitmap?: ImageBitmap,
  options?: RendererOptions,
) {
  const device = useGpuDevice()
  const format = useGpuFormat()
  const pipeline = useImagePipeline()
  const texture = useImageTexture(bitmap)
  const uniformBuffer = useImageUniformBuffer(device)
  const exposure = options?.lighting?.exposure ?? 0
  const contrast = options?.lighting?.contrast ?? 1
  const saturation = options?.lighting?.saturation ?? 1
  const vibrance = options?.lighting?.vibrance ?? 0
  const highlights = options?.lighting?.highlights ?? 0
  const shadows = options?.lighting?.shadows ?? 0
  const whites = options?.lighting?.whites ?? 0
  const blacks = options?.lighting?.blacks ?? 0
  const tint = options?.lighting?.tint ?? 0
  const temperature = options?.lighting?.temperature ?? 0
  const hue = options?.lighting?.hue ?? 0

  return useSuspenseQuery({
    queryKey: [
      'image-render',
      canvasId,
      bitmap,
      bitmap?.width,
      bitmap?.height,
      exposure,
      contrast,
      saturation,
      vibrance,
      highlights,
      shadows,
      whites,
      blacks,
      tint,
      temperature,
      hue,
      device,
      format,
      pipeline.data,
      texture.data,
      uniformBuffer.data,
    ],
    queryFn: () => {
      if (typeof document === 'undefined')
        return false

      if (!bitmap || !device || !format || !pipeline.data || !texture.data || !uniformBuffer.data)
        return false

      const canvas = document.getElementById(canvasId) as HTMLCanvasElement
      const context = canvas?.getContext('webgpu')
      if (!context)
        return false

      context.configure({
        device,
        format,
        alphaMode: 'premultiplied',
      })

      device.queue.writeBuffer(
        uniformBuffer.data,
        0,
        new Float32Array([
          exposure,
          contrast,
          saturation,
          vibrance,
          highlights,
          shadows,
          whites,
          blacks,
          tint,
          temperature,
          hue,
          0,
        ]),
      )

      const bindGroup = device.createBindGroup({
        layout: pipeline.data.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: uniformBuffer.data,
            },
          },
          {
            binding: 1,
            resource: device.createSampler({
              magFilter: 'linear',
              minFilter: 'linear',
            }),
          },
          {
            binding: 2,
            resource: texture.data.createView(),
          },
        ],
      })

      const commandEncoder = device.createCommandEncoder()
      const textureView = context.getCurrentTexture().createView()

      const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      })

      passEncoder.setPipeline(pipeline.data)
      passEncoder.setBindGroup(0, bindGroup)
      passEncoder.draw(4)
      passEncoder.end()

      device.queue.submit([commandEncoder.finish()])

      return true
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}
