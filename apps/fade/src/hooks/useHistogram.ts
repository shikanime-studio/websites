import { useAtomSuspense } from "@effect/atom-react";
import { useMemo } from "react";
import { gpuHistogramAtom } from "../lib/histogram-atom";
import histogramShader from "../shaders/histogram.wgsl?raw";
import { useGPU } from "./useGPU";

export interface Bins {
  r: Array<number>;
  g: Array<number>;
  b: Array<number>;
}

function useHistogramComputePipeline() {
  const { device } = useGPU();

  return useMemo(() => {
    if (!device) return null;

    const shaderModule = device.createShaderModule({
      code: histogramShader,
    });

    return device.createComputePipeline({
      layout: "auto",
      compute: {
        module: shaderModule,
        entryPoint: "cs_main",
      },
    });
  }, [device]);
}

function useHistogramNormalizePipeline() {
  const { device } = useGPU();

  return useMemo(() => {
    if (!device) return null;

    const shaderModule = device.createShaderModule({
      code: histogramShader,
    });

    return device.createComputePipeline({
      layout: "auto",
      compute: {
        module: shaderModule,
        entryPoint: "cs_normalize",
      },
    });
  }, [device]);
}

export function useHistogram(image: HTMLImageElement | null) {
  const { device } = useGPU();
  const computePipeline = useHistogramComputePipeline();
  const normalizePipeline = useHistogramNormalizePipeline();

  return useAtomSuspense(
    gpuHistogramAtom(image, device, computePipeline, normalizePipeline),
  ).value;
}
