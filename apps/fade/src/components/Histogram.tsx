import { useSuspenseQuery } from "@tanstack/react-query";
import { useImageInfo } from "../hooks/useImageInfo";
import { useGPU } from "../hooks/useGPU";
import histogramShader from "../shaders/histogram.wgsl?raw";

interface HistogramProps {
  className?: string;
}

async function computeHistogram(device: GPUDevice, image: HTMLImageElement) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  if (width === 0 || height === 0) {
    return { r: [], g: [], b: [] };
  }

  // 1. Create Texture
  const texture = device.createTexture({
    size: [width, height],
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture({ source: image }, { texture }, [
    width,
    height,
  ]);

  // 2. Create Buffers
  const bufferSize = 256 * 3 * 4; // 3 arrays of 256 u32s (4 bytes each)
  const storageBuffer = device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const readBuffer = device.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  // 3. Pipeline
  const shaderModule = device.createShaderModule({
    code: histogramShader,
  });

  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: {
      module: shaderModule,
      entryPoint: "main",
    },
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: storageBuffer } },
      { binding: 1, resource: texture.createView() },
    ],
  });

  // 4. Encode Commands
  const commandEncoder = device.createCommandEncoder();

  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(Math.ceil(width / 16), Math.ceil(height / 16));
  passEncoder.end();

  commandEncoder.copyBufferToBuffer(
    storageBuffer,
    0,
    readBuffer,
    0,
    bufferSize,
  );

  device.queue.submit([commandEncoder.finish()]);

  // 5. Read back
  await readBuffer.mapAsync(GPUMapMode.READ);

  const arrayBuffer = readBuffer.getMappedRange();
  const result = new Uint32Array(arrayBuffer);

  // result has 768 elements. 0-255 R, 256-511 G, 512-767 B.
  const r = Array.from(result.slice(0, 256));
  const g = Array.from(result.slice(256, 512));
  const b = Array.from(result.slice(512, 768));

  readBuffer.unmap();

  // Cleanup
  readBuffer.destroy();
  storageBuffer.destroy();
  texture.destroy();

  // Normalize
  const maxCount = Math.max(...r, ...g, ...b);
  const normalize = (arr: Array<number>) =>
    arr.map((v) => (maxCount > 0 ? (v / maxCount) * 100 : 0));

  return {
    r: normalize(r),
    g: normalize(g),
    b: normalize(b),
  };
}

function HistogramContent({
  className,
  image,
  device,
}: HistogramProps & { image: HTMLImageElement; device: GPUDevice }) {
  const { data } = useSuspenseQuery({
    queryKey: ["histogram", image.src],
    queryFn: () => computeHistogram(device, image),
  });

  return (
    <div
      className={`relative h-32 w-full bg-black rounded-md overflow-hidden ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 256 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <g>
          <path
            d={`M0,100 ${data.r
              .map((v, i) => `L${i.toString()},${(100 - v).toString()}`)
              .join(" ")} L255,100 Z`}
            fill="#ff0000"
            className="opacity-80"
            style={{ mixBlendMode: "screen" }}
          />
          <path
            d={`M0,100 ${data.g
              .map((v, i) => `L${i.toString()},${(100 - v).toString()}`)
              .join(" ")} L255,100 Z`}
            fill="#00ff00"
            className="opacity-80"
            style={{ mixBlendMode: "screen" }}
          />
          <path
            d={`M0,100 ${data.b
              .map((v, i) => `L${i.toString()},${(100 - v).toString()}`)
              .join(" ")} L255,100 Z`}
            fill="#0000ff"
            className="opacity-80"
            style={{ mixBlendMode: "screen" }}
          />
        </g>
      </svg>
    </div>
  );
}

export function Histogram({ className }: HistogramProps) {
  const { image } = useImageInfo();
  const { device } = useGPU();

  if (!image || !device) return null;

  return (
    <HistogramContent className={className} image={image} device={device} />
  );
}
