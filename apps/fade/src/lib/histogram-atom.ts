import type { Bins } from "../hooks/useHistogram";
import { emptyAtom, queryAtom } from "./atoms";
import { computeHistogram } from "./histogram";

export function gpuHistogramAtom(
  image: HTMLImageElement | null,
  device: GPUDevice | null,
  computePipeline: GPUComputePipeline | null,
  normalizePipeline: GPUComputePipeline | null,
) {
  const imageKey = image
    ? {
        src: image.currentSrc || image.src,
        width: image.naturalWidth,
        height: image.naturalHeight,
      }
    : null;
  if (!image || !imageKey) {
    return emptyAtom as unknown as ReturnType<
      typeof queryAtom<Bins | null>
    >;
  }
  const namespace = `histogram:${imageKey.src}:${String(imageKey.width)}x${String(imageKey.height)}:${device ? "gpu" : "cpu"}:${computePipeline ? "c" : "-"}:${normalizePipeline ? "n" : "-"}`;
  return queryAtom<Bins | null>(namespace, [image], () =>
    computeHistogram({
      device,
      computePipeline,
      normalizePipeline,
      imageKey,
    }),
  );
}
