import type { RefObject } from 'react'
import { isContainer, sizeOf, TiffMagicNumber } from '@shikanime-studio/medialab/tiff'
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

interface RafTextureResources { kind: 'texture', texture: GPUTexture }
interface RafPackedResources { kind: 'packed', packedBuffer: GPUBuffer, infoBuffer: GPUBuffer }
type RafResources = RafTextureResources | RafPackedResources

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

export function getRafRasterFromPayload(
  payload: Uint8Array<ArrayBuffer>,
  width: number,
  height: number,
): { data: Uint8Array<ArrayBuffer>, bitsPerSample: 16 | 14, swapEndian: boolean } | null {
  if (width <= 0 || height <= 0)
    return null

  const pixelCount = width * height
  const expectedByteLength = pixelCount * 2
  const packed14ByteLength = Math.ceil((pixelCount * 14) / 8)

  if (payload.byteLength === expectedByteLength) {
    return {
      data: new Uint8Array(payload),
      bitsPerSample: 16,
      swapEndian: true,
    }
  }

  if (payload.byteLength === packed14ByteLength) {
    return {
      data: new Uint8Array(payload),
      bitsPerSample: 14,
      swapEndian: false,
    }
  }

  const dv = new DataView(payload.buffer, payload.byteOffset, payload.byteLength)
  const b0 = dv.getUint8(0)
  const b1 = dv.getUint8(1)
  const isLittle = b0 === 0x49 && b1 === 0x49
  const isBig = b0 === 0x4D && b1 === 0x4D
  if (!isLittle && !isBig)
    return null

  const littleEndian = isLittle
  const swapEndian = isBig

  const tiffMagic = dv.getUint16(2, littleEndian)
  if (tiffMagic !== TiffMagicNumber)
    return null

  const ifdOffset = dv.getUint32(4, littleEndian)
  if (!ifdOffset || ifdOffset + 2 > dv.byteLength)
    return null

  const entryCount = dv.getUint16(ifdOffset, littleEndian)
  const entriesOffset = ifdOffset + 2
  const entriesByteLength = entryCount * 12
  if (entriesOffset + entriesByteLength > dv.byteLength)
    return null

  function readUnsigned(type: number, offset: number) {
    if (type === 3)
      return dv.getUint16(offset, littleEndian)
    if (type === 4)
      return dv.getUint32(offset, littleEndian)
    return null
  }

  function readUnsignedArray(type: number, count: number, offset: number) {
    if (type !== 3 && type !== 4)
      return null

    const values: number[] = []
    const step = type === 3 ? 2 : 4
    const byteLength = count * step
    if (offset < 0 || offset + byteLength > dv.byteLength)
      return null

    for (let i = 0; i < count; i++) {
      const v = readUnsigned(type, offset + i * step)
      if (v === null)
        return null
      values.push(v)
    }
    return values
  }

  function getIfdValue(tagId: number) {
    for (let i = 0; i < entryCount; i++) {
      const entryOffset = entriesOffset + i * 12
      const id = dv.getUint16(entryOffset, littleEndian)
      if (id !== tagId)
        continue

      const type = dv.getUint16(entryOffset + 2, littleEndian)
      const count = dv.getUint32(entryOffset + 4, littleEndian)
      const valueOrOffset = dv.getUint32(entryOffset + 8, littleEndian)

      const dataSize = sizeOf(type as any) * count
      const valueOffset = (dataSize <= 4 && !isContainer(type as any))
        ? entryOffset + 8
        : valueOrOffset

      if (count === 1) {
        const v = readUnsigned(type, valueOffset)
        return v === null ? null : [v]
      }

      return readUnsignedArray(type, count, valueOffset)
    }
    return null
  }

  const tiffWidth = getIfdValue(256)?.[0] ?? null
  const tiffHeight = getIfdValue(257)?.[0] ?? null
  if (tiffWidth !== width || tiffHeight !== height)
    return null

  const compression = getIfdValue(259)?.[0] ?? null
  if (compression !== 1)
    return null

  const bitsPerSample = getIfdValue(258)?.[0] ?? null
  if (bitsPerSample !== 16 && bitsPerSample !== 14)
    return null

  const stripOffsets = getIfdValue(273)
  const stripByteCounts = getIfdValue(279)
  if (!stripOffsets || !stripByteCounts || stripOffsets.length !== stripByteCounts.length)
    return null

  const joinedByteLength = stripByteCounts.reduce((sum, n) => sum + n, 0)
  if (joinedByteLength <= 0)
    return null

  const joined = new Uint8Array(joinedByteLength)
  let joinedOffset = 0

  for (let i = 0; i < stripOffsets.length; i++) {
    const stripOffset = stripOffsets[i]
    const stripLength = stripByteCounts[i]
    if (stripOffset < 0 || stripLength < 0 || stripOffset + stripLength > dv.byteLength)
      return null

    joined.set(
      new Uint8Array(payload.buffer, payload.byteOffset + stripOffset, stripLength),
      joinedOffset,
    )
    joinedOffset += stripLength
  }

  if (bitsPerSample === 16) {
    if (joined.byteLength !== expectedByteLength)
      return null

    return {
      data: joined,
      bitsPerSample: 16,
      swapEndian,
    }
  }

  const expectedPackedBytes = Math.ceil((pixelCount * 14) / 8)
  if (joined.byteLength < expectedPackedBytes)
    return null

  const packed = joined.byteLength === expectedPackedBytes
    ? joined
    : joined.subarray(0, expectedPackedBytes)

  return {
    data: new Uint8Array(packed),
    bitsPerSample: 14,
    swapEndian: false,
  }
}

function useRafImagePipeline() {
  const { device, format } = useGPU()

  return useMemo(() => {
    if (!device || !format)
      return null

    const shaderModule = device.createShaderModule({
      code: rafShader,
    })

    const create = (targetFormat: GPUTextureFormat) => {
      const texturePipeline = device.createRenderPipeline({
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
            },
          ],
        },
        primitive: {
          topology: 'triangle-strip',
        },
      })

      const packedPipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vs_main',
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fs_main_packed',
          targets: [
            {
              format: targetFormat,
            },
          ],
        },
        primitive: {
          topology: 'triangle-strip',
        },
      })

      return { texturePipeline, packedPipeline }
    }

    return {
      screen: create(format),
      rgba16: create('rgba16float'),
    }
  }, [device, format])
}

export function useRafImageRender(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number,
  payload: Uint8Array<ArrayBuffer>,
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
  const pipelines = useRafImagePipeline()

  const raster = useMemo(
    () => getRafRasterFromPayload(payload, width, height),
    [payload, width, height],
  )

  const resources = useMemo<RafResources | null>(() => {
    if (!device || width <= 0 || height <= 0 || !raster)
      return null

    try {
      if (raster.bitsPerSample === 16) {
        const tex = device.createTexture({
          size: [width, height],
          format: 'r16uint',
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })

        device.queue.writeTexture(
          { texture: tex },
          raster.data,
          { bytesPerRow: width * 2 },
          { width, height },
        )

        return { kind: 'texture', texture: tex }
      }

      if (raster.bitsPerSample === 14) {
        const paddedSize = Math.ceil(raster.data.byteLength / 4) * 4
        const padded = new Uint8Array(paddedSize)
        padded.set(raster.data)

        const packedBuffer = device.createBuffer({
          size: paddedSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })

        device.queue.writeBuffer(packedBuffer, 0, padded)

        const infoBuffer = device.createBuffer({
          size: 16,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
        device.queue.writeBuffer(
          infoBuffer,
          0,
          new Uint32Array([width, height, raster.bitsPerSample, 0]),
        )

        return { kind: 'packed', packedBuffer, infoBuffer }
      }

      return null
    }
    catch (e) {
      console.error('Failed to create/upload GPU resources:', e)
      return null
    }
  }, [device, width, height, raster])

  const getOutput = useMemo(() => {
    if (!device || !pipelines?.rgba16 || !resources || !raster)
      return null

    return async () => {
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
          raster.swapEndian ? 1 : 0,
        ]),
      )

      let pipeline: GPURenderPipeline
      let bindGroup: GPUBindGroup

      if (raster.bitsPerSample === 14) {
        if (resources.kind !== 'packed')
          return null
        pipeline = pipelines.rgba16.packedPipeline
        bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            {
              binding: 1,
              resource: { buffer: uniformBuffer },
            },
            {
              binding: 2,
              resource: { buffer: resources.packedBuffer },
            },
            {
              binding: 3,
              resource: { buffer: resources.infoBuffer },
            },
          ],
        })
      }
      else if (raster.bitsPerSample === 16) {
        if (resources.kind !== 'texture')
          return null
        pipeline = pipelines.rgba16.texturePipeline
        bindGroup = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: resources.texture.createView(),
            },
            {
              binding: 1,
              resource: { buffer: uniformBuffer },
            },
          ],
        })
      }
      else {
        return null
      }

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

      pass.setPipeline(pipeline)
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
    pipelines?.rgba16,
    resources,
    raster,
    width,
    height,
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
    if (!device || !canvas || !format || !pipelines?.screen || !resources || !raster) {
      return
    }

    const context = canvas.getContext('webgpu')
    if (!context) {
      console.error('Could not get GPU context')
      return
    }

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
        raster.swapEndian ? 1 : 0,
      ]),
    )

    let pipeline: GPURenderPipeline
    let bindGroup: GPUBindGroup

    if (raster.bitsPerSample === 14) {
      if (resources.kind !== 'packed')
        return
      pipeline = pipelines.screen.packedPipeline
      bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 1,
            resource: { buffer: uniformBuffer },
          },
          {
            binding: 2,
            resource: { buffer: resources.packedBuffer },
          },
          {
            binding: 3,
            resource: { buffer: resources.infoBuffer },
          },
        ],
      })
    }
    else if (raster.bitsPerSample === 16) {
      if (resources.kind !== 'texture')
        return
      pipeline = pipelines.screen.texturePipeline
      bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: resources.texture.createView(),
          },
          {
            binding: 1,
            resource: { buffer: uniformBuffer },
          },
        ],
      })
    }
    else {
      return
    }

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
    pipelines?.screen,
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
  ])

  return { getOutput }
}
