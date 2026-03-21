import type { RefObject } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { z } from 'zod'
import imageShader from '../shaders/image.wgsl?raw'
import { retryDelay } from './utils'

const LightingParamsSchema = z.object({
  exposure: z.number().default(0),
  contrast: z.number().default(1),
  saturation: z.number().default(1),
  vibrance: z.number().default(0),
  highlights: z.number().default(0),
  shadows: z.number().default(0),
  whites: z.number().default(0),
  blacks: z.number().default(0),
  tint: z.number().default(0),
  temperature: z.number().default(0),
  hue: z.number().default(0),
})

export type LightingParams = z.infer<typeof LightingParamsSchema>

export interface RendererOptions {
  lighting?: Partial<LightingParams>
}

const RendererOptionsSchema = z.object({
  lighting: LightingParamsSchema.optional(),
}).default({})

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
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}

function useImageTexture(device: GPUDevice | null, image: HTMLImageElement | null) {
  return useSuspenseQuery({
    queryKey: ['image-texture', device, image],
    queryFn: () => {
      if (!device || !image || !image.complete || image.naturalWidth === 0) {
        return null
      }

      const tex = device.createTexture({
        size: [image.naturalWidth, image.naturalHeight],
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING
          | GPUTextureUsage.COPY_DST
          | GPUTextureUsage.RENDER_ATTACHMENT,
      })

      device.queue.copyExternalImageToTexture(
        { source: image },
        { texture: tex },
        { width: image.naturalWidth, height: image.naturalHeight },
      )

      return tex
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}

export function useImageRender(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  device: GPUDevice | null,
  format: GPUTextureFormat | null,
  image: HTMLImageElement | null,
  options?: RendererOptions,
) {
  const { data: pipeline } = useImagePipeline(device, format)
  const { data: texture } = useImageTexture(device, image)
  const resolvedOptions = RendererOptionsSchema.parse(options)
  const lighting = LightingParamsSchema.parse(resolvedOptions.lighting ?? {}) as LightingParams

  return useSuspenseQuery({
    queryKey: [
      'image-render',
      canvasRef,
      image,
      device,
      format,
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
      pipeline,
      texture,
    ],
    queryFn: () => {
      const canvas = canvasRef.current
      if (!device || !canvas || !format || !pipeline || !texture) {
        return
      }

      const context = canvas.getContext('webgpu') as GPUCanvasContext | null
      if (!context) {
        return
      }

      context.configure({
        device,
        format,
        alphaMode: 'premultiplied',
      })

      const uniformBuffer = device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

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
    },
  })
}
