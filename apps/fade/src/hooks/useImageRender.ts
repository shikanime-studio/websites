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

function useImagePipeline() {
  const { device, format } = useGPU()

  return useMemo(() => {
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
  }, [device, format])
}

export function useImageRender(
  context: GPUCanvasContext | null,
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
  const pipeline = useImagePipeline()

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

  useEffect(() => {
    if (!device || !context || !format || !pipeline || !texture) {
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
    passEncoder.setPipeline(pipeline)
    passEncoder.setBindGroup(0, bindGroup)
    passEncoder.draw(4)
    passEncoder.end()

    device.queue.submit([commandEncoder.finish()])
  }, [
    device,
    context,
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
