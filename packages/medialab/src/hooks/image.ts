import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import imageShader from '../shaders/image.wgsl?raw'
import { retryDelay } from '../utils'
import { useGpuDevice, useGpuFormat } from './gpu'

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

function useImagePipeline(device: GPUDevice | null, format: GPUTextureFormat | null) {
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
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

function useImageTexture(device: GPUDevice | null, image: HTMLImageElement | null) {
  const src = image ? (image.currentSrc || image.src) : null
  const width = image?.naturalWidth ?? 0
  const height = image?.naturalHeight ?? 0

  return useSuspenseQuery({
    queryKey: ['image-texture', device, src, width, height],
    queryFn: async () => {
      if (!device || !src || width <= 0 || height <= 0) {
        return null
      }

      const response = await fetch(src)
      const blob = await response.blob()
      const bitmap = await createImageBitmap(blob)

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
        { width: bitmap.width, height: bitmap.height },
      )

      return tex
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
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
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
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
  image: HTMLImageElement | null,
  options?: RendererOptions,
) {
  const { data: device } = useGpuDevice()
  const format = useGpuFormat()
  const { data: pipeline } = useImagePipeline(device, format)
  const { data: texture } = useImageTexture(device, image)
  const { data: uniformBuffer } = useImageUniformBuffer(device)

  return useSuspenseQuery({
    queryKey: [
      'image-render',
      canvasId,
      device,
      format,
      pipeline,
      texture,
      uniformBuffer,
      options?.lighting?.exposure,
      options?.lighting?.contrast,
      options?.lighting?.saturation,
      options?.lighting?.vibrance,
      options?.lighting?.highlights,
      options?.lighting?.shadows,
      options?.lighting?.whites,
      options?.lighting?.blacks,
      options?.lighting?.tint,
      options?.lighting?.temperature,
      options?.lighting?.hue,
    ],
    queryFn: () => {
      if (typeof document === 'undefined')
        return null

      const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
      if (!device || !canvas || !format || !pipeline || !texture || !uniformBuffer) {
        return null
      }

      const context = canvas.getContext('webgpu') as GPUCanvasContext | null
      if (!context) {
        return null
      }

      context.configure({
        device,
        format,
        alphaMode: 'premultiplied',
      })

      const lighting: LightingParams = {
        exposure: options?.lighting?.exposure ?? 0,
        contrast: options?.lighting?.contrast ?? 1,
        saturation: options?.lighting?.saturation ?? 1,
        vibrance: options?.lighting?.vibrance ?? 0,
        highlights: options?.lighting?.highlights ?? 0,
        shadows: options?.lighting?.shadows ?? 0,
        whites: options?.lighting?.whites ?? 0,
        blacks: options?.lighting?.blacks ?? 0,
        tint: options?.lighting?.tint ?? 0,
        temperature: options?.lighting?.temperature ?? 0,
        hue: options?.lighting?.hue ?? 0,
      }

      device.queue.writeBuffer(
        uniformBuffer,
        0,
        new Float32Array([
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
        ]),
      )

      const bindGroup = device.createBindGroup({
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
              magFilter: 'linear',
              minFilter: 'linear',
            }),
          },
          {
            binding: 2,
            resource: texture.createView(),
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

      passEncoder.setPipeline(pipeline)
      passEncoder.setBindGroup(0, bindGroup)
      passEncoder.draw(4)
      passEncoder.end()

      device.queue.submit([commandEncoder.finish()])

      return true
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}
