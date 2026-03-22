import type { RefObject } from 'react'
import type { CfaDataView, FileItem } from '../raf'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { z } from 'zod'
import { createRafDataView, decodeRafRasterToU16, getRafRasterFromPayload } from '../raf'
import rafShader from '../shaders/raf.wgsl?raw'
import { useGpuDevice, useGpuFormat } from './gpu'
import { retryDelay } from './utils'

const LightingParamsSchema = z.object({
  exposure: z.number().default(0),
  contrast: z.number().default(1),
  saturation: z.number().default(1),
  vibrance: z.number().default(0),
  highlights: z.number().default(1),
  shadows: z.number().default(1),
  whites: z.number().default(1),
  blacks: z.number().default(1),
  tint: z.number().default(0),
  temperature: z.number().default(0),
  hue: z.number().default(0),
})

export type LightingParams = z.infer<typeof LightingParamsSchema>

export type CfaPattern = 'RGGB' | 'BGGR' | 'GRBG' | 'GBRG'

const CfaPatternSchema = z.enum(['RGGB', 'BGGR', 'GRBG', 'GBRG']).default('RGGB')

export interface RafRendererOptions {
  lighting?: Partial<LightingParams>
  pattern?: CfaPattern
}

const RafRendererOptionsSchema = z.object({
  lighting: LightingParamsSchema.optional(),
  pattern: CfaPatternSchema.optional(),
}).default({})

export interface RafDecodedRaster {
  width: number
  height: number
  bitsPerSample: number
  data: Uint16Array<ArrayBuffer>
}

function patternToId(pattern: CfaPattern) {
  switch (pattern) {
    case 'RGGB':
      return 0
    case 'BGGR':
      return 1
    case 'GRBG':
      return 2
    case 'GBRG':
      return 3
  }
}

function useRafDecodedRaster(cfa: CfaDataView<ArrayBufferLike> | null) {
  return useSuspenseQuery({
    queryKey: ['raf-decoded-raster', cfa],
    queryFn: async (): Promise<RafDecodedRaster | null> => {
      if (!cfa)
        return null

      const payload = cfa.getPayload()
      if (!payload)
        return null

      const littleEndian = payload.getLittleEndian()
      const firstIfdOffset = payload.getFirstIfdOffset(littleEndian)
      if (!firstIfdOffset)
        return null

      const width = payload.getImageWidth(firstIfdOffset, littleEndian)
      const height = payload.getImageLength(firstIfdOffset, littleEndian)
      const bitsPerSample = payload.getBitsPerSample(firstIfdOffset, littleEndian)
      if (!width || !height || !bitsPerSample)
        return null

      const payloadBytes = new Uint8Array(
        payload.buffer as ArrayBuffer,
        payload.byteOffset,
        payload.byteLength,
      )

      const raster = getRafRasterFromPayload(payloadBytes, width, height)
      if (!raster)
        return null

      const decoded = decodeRafRasterToU16(raster, width, height)
      if (!decoded)
        return null

      return { width, height, bitsPerSample, data: decoded as Uint16Array<ArrayBuffer> }
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}

function useRafPipeline(device: GPUDevice | null, format: GPUTextureFormat | null) {
  return useSuspenseQuery({
    queryKey: ['raf-pipeline', device, format],
    queryFn: () => {
      if (!device || !format)
        return null

      const shaderModule = device.createShaderModule({ code: rafShader })
      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vs_main',
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fs_main',
          targets: [{ format }],
        },
        primitive: {
          topology: 'triangle-list',
        },
      })

      const bindGroupLayout = pipeline.getBindGroupLayout(0)
      const uniformBuffer = device.createBuffer({
        size: 16 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      return { bindGroupLayout, pipeline, uniformBuffer }
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}

export function useRafImage(fileItem: FileItem | null) {
  return useSuspenseQuery({
    queryKey: ['raf-image', fileItem],
    queryFn: async () => {
      if (!fileItem)
        return null
      const view = await createRafDataView(fileItem)
      if (!view)
        return null
      return view.getCfa() as CfaDataView<ArrayBufferLike>
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity,
  })
}

export function useRafRender(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  cfa: CfaDataView<ArrayBufferLike> | null,
  options: RafRendererOptions = {},
) {
  const { device } = useGpuDevice()
  const format = useGpuFormat()
  const { data: resources } = useRafPipeline(device, format)
  const { data: raster } = useRafDecodedRaster(cfa)

  const resolvedOptions = RafRendererOptionsSchema.parse(options)
  const lighting = LightingParamsSchema.parse(resolvedOptions.lighting ?? {}) as LightingParams
  const pattern = CfaPatternSchema.parse(resolvedOptions.pattern) as CfaPattern

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !resources || !device || !format || !raster)
      return

    const { width, height, bitsPerSample, data } = raster
    if (width <= 0 || height <= 0)
      return
    if (canvas.width !== width)
      canvas.width = width
    if (canvas.height !== height)
      canvas.height = height

    const sourceTexture = device.createTexture({
      size: [width, height],
      format: 'r16uint',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    })

    device.queue.writeTexture(
      { texture: sourceTexture },
      data,
      { bytesPerRow: width * 2 },
      { width, height },
    )

    const context = canvas.getContext('webgpu') as GPUCanvasContext | null
    if (!context)
      return

    context.configure({
      device,
      format,
      alphaMode: 'premultiplied',
    })

    const maxVal = (1 << bitsPerSample) - 1

    const uniforms = new Float32Array([
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
      maxVal,
      patternToId(pattern),
      0,
      0,
    ])

    device.queue.writeBuffer(resources.uniformBuffer, 0, uniforms)

    const bindGroup = device.createBindGroup({
      layout: resources.bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: sourceTexture.createView(),
        },
        {
          binding: 1,
          resource: { buffer: resources.uniformBuffer },
        },
      ],
    })

    const commandEncoder = device.createCommandEncoder()
    const pass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        },
      ],
    })

    pass.setPipeline(resources.pipeline)
    pass.setBindGroup(0, bindGroup)
    pass.draw(6)
    pass.end()

    device.queue.submit([commandEncoder.finish()])
  }, [
    canvasRef,
    device,
    format,
    resources,
    raster,
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
    pattern,
  ])
}
