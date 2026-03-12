import type { RefObject } from 'react'
import { useEffect, useMemo } from 'react'
import rafShader from '../shaders/raf.wgsl?raw'
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

function useRawImagePipeline() {
  const { device, format } = useGPU()

  return useMemo(() => {
    if (!device || !format)
      return null

    const shaderModule = device.createShaderModule({
      code: rafShader,
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
          },
        ],
      },
      primitive: {
        topology: 'triangle-strip',
      },
    })
  }, [device, format])
}

export function useRawImageRender(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number,
  data: ArrayBufferLike,
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
  const pipeline = useRawImagePipeline()
  const texture = useMemo(() => {
    if (!device || width <= 0 || height <= 0)
      return null

    try {
      // Create texture for raw data
      const tex = device.createTexture({
        size: [width, height],
        format: 'r16uint',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      })

      // Upload data
      device.queue.writeTexture(
        { texture: tex },
        data,
        { bytesPerRow: width * 2 },
        { width, height },
      )

      return tex
    }
    catch (e) {
      console.error('Failed to create/upload texture:', e)
      return null
    }
  }, [device, width, height, data])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!device || !canvas || !format || !pipeline || !texture) {
      return
    }

    const context = canvas.getContext('webgpu')
    if (!context) {
      console.error('Could not get GPU context')
      return
    }

    // Create uniform buffer
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
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: texture.createView(),
        },
        {
          binding: 1,
          resource: { buffer: uniformBuffer },
        },
      ],
    })

    context.configure({
      device,
      format,
      alphaMode: 'premultiplied',
    })

    const commandEncoder = device.createCommandEncoder()
    const textureView = context.getCurrentTexture().createView()

    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: [0, 0, 0, 1],
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
  }, [
    canvasRef,
    device,
    format,
    pipeline,
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
}
