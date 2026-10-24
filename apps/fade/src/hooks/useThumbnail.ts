import type { FileItem } from "../lib/fs";
import { useAtomSuspense } from "@effect/atom-react";
import { useMemo } from "react";
import { gpuThumbnailAtom } from "../lib/thumbnail-atom";
import thumbnailShader from "../shaders/thumbnail.wgsl?raw";
import { useGPU } from "./useGPU";
import { usePreview } from "./usePreview";

function useThumbnailPipeline() {
  const { device } = useGPU();

  return useMemo(() => {
    if (!device) return null;

    const shaderModule = device.createShaderModule({
      code: thumbnailShader,
    });

    return device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [
          {
            format: "rgba8unorm",
          },
        ],
      },
      primitive: {
        topology: "triangle-strip",
      },
    });
  }, [device]);
}

export function useThumbnail(
  fileItem: FileItem | null,
  width = 256,
  height = 256,
  quality = 1.0,
) {
  const { device } = useGPU();
  const { blob } = usePreview(fileItem);
  const pipeline = useThumbnailPipeline();

  const url = useAtomSuspense(
    gpuThumbnailAtom({ blob, device, pipeline, fileItem, width, height, quality }),
  ).value;

  return { url };
}
