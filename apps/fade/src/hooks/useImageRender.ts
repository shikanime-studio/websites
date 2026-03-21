import type { RefObject } from 'react'
import { useEffect, useMemo } from 'react'
import imageShader from '../shaders/image.wgsl?raw'
import { useGPU } from './useGPU'

interface LightingParams {
  exposure: number
  contrast: number
  saturation: number
  highlights: number
  shadows: number
  whites: number
  blacks: number
  tint: number
  temperature: number
  vibrance: number
  hue: number
}

function alignTo(value: number, alignment: number) {
  return Math.ceil(value / alignment) * alignment
}

function halfToFloat(h: number) {
  const s = (h & 0x8000) >> 15
  const e = (h & 0x7C00) >> 10
  const f = h & 0x03FF

  if (e === 0) {
    if (f === 0)
      return s ? -0 : 0
    return (s ? -1 : 1) * 2 ** (-14) * (f / 2 ** 10)
  }

  if (e === 0x1F)
    return f ? Number.NaN : (s ? -Infinity : Infinity)

  return (s ? -1 : 1) * 2 ** (e - 15) * (1 + f / 2 ** 10)
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function useImagePipelines() {
  const { device, format } = useGPU()

  return useMemo(() => {
    if (!device || !format)
      return null

    const shaderModule = device.createShaderModule({
      code: imageShader,
    })

    const createPipeline = (targetFormat: GPUTextureFormat) =>
      device.createRenderPipeline({
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
              format: targetFormat,
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

    return {
      screenPipeline: createPipeline(format),
      rgba16Pipeline: createPipeline('rgba16float'),
    }
  }, [device, format])
}

export function useImageRender(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  image: HTMLImageElement | null,
  lighting: LightingParams = {
    exposure: 0,
    contrast: 1,
    saturation: 1,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    tint: 0,
    temperature: 0,
    vibrance: 0,
    hue: 0,
  },
) {
  const { device, format } = useGPU()
  const pipelines = useImagePipelines()

  const texture = useMemo(() => {
    if (!device || !image || !image.complete || image.naturalWidth === 0) {
      return null
    }

    try {
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
    }
    catch (e) {
      console.error('Failed to create texture from image:', e)
      return null
    }
  }, [device, image])

  const getOutput = useMemo(() => {
    if (!device || !pipelines?.rgba16Pipeline || !texture || !image)
      return null

    return async () => {
      const width = image.naturalWidth
      const height = image.naturalHeight

      if (width <= 0 || height <= 0)
        return null

      const outputTexture = device.createTexture({
        size: [width, height],
        format: 'rgba16float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
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
        layout: pipelines.rgba16Pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: { buffer: uniformBuffer },
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

      const bytesPerPixel = 8
      const bytesPerRow = alignTo(width * bytesPerPixel, 256)
      const bufferSize = bytesPerRow * height

      const readback = device.createBuffer({
        size: bufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      })

      const encoder = device.createCommandEncoder()
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: outputTexture.createView(),
            clearValue: [0, 0, 0, 0],
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      })
      pass.setPipeline(pipelines.rgba16Pipeline)
      pass.setBindGroup(0, bindGroup)
      pass.draw(4)
      pass.end()

      encoder.copyTextureToBuffer(
        { texture: outputTexture },
        { buffer: readback, bytesPerRow, rowsPerImage: height },
        { width, height },
      )

      device.queue.submit([encoder.finish()])
      await device.queue.onSubmittedWorkDone()

      await readback.mapAsync(GPUMapMode.READ)
      try {
        const mapped = readback.getMappedRange()
        const u16 = new Uint16Array(mapped)
        const rgba16 = new Uint16Array(width * height * 4)

        const rowStrideU16 = bytesPerRow / 2
        const pixelStrideU16 = 4

        for (let y = 0; y < height; y++) {
          const rowStart = y * rowStrideU16
          const outRowStart = y * width * 4
          for (let x = 0; x < width; x++) {
            const i = rowStart + x * pixelStrideU16
            const o = outRowStart + x * 4

            const r = clamp01(halfToFloat(u16[i + 0]))
            const g = clamp01(halfToFloat(u16[i + 1]))
            const b = clamp01(halfToFloat(u16[i + 2]))
            const a = clamp01(halfToFloat(u16[i + 3]))

            rgba16[o + 0] = Math.round(r * 65535)
            rgba16[o + 1] = Math.round(g * 65535)
            rgba16[o + 2] = Math.round(b * 65535)
            rgba16[o + 3] = Math.round(a * 65535)
          }
        }

        return { width, height, rgba16 }
      }
      finally {
        readback.unmap()
      }
    }
  }, [
    device,
    image,
    pipelines?.rgba16Pipeline,
    texture,
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
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!device || !canvas || !format || !pipelines?.screenPipeline || !texture) {
      return
    }

    const context = canvas.getContext('webgpu')
    if (!context) {
      console.error('Could not get GPU context')
      return
    }

    context.configure({
      device,
      format,
      alphaMode: 'premultiplied',
    })

    const uniformBuffer = device.createBuffer({
      size: 48, // 12 floats * 4 bytes
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
        0, // padding
      ]),
    )

    const bindGroup = device.createBindGroup({
      layout: pipelines.screenPipeline.getBindGroupLayout(0),
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

    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    }

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
    passEncoder.setPipeline(pipelines.screenPipeline)
    passEncoder.setBindGroup(0, bindGroup)
    passEncoder.draw(4)
    passEncoder.end()

    device.queue.submit([commandEncoder.finish()])
  }, [
    canvasRef,
    device,
    format,
    pipelines?.screenPipeline,
    texture,
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
  ])

  return { getOutput }
}
