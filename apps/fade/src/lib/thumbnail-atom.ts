import type { FileItem } from "./fs";
import { emptyAtom, queryAtom } from "./atoms";
import { renderThumbnail } from "./thumbnail";

export function gpuThumbnailAtom(input: {
  blob: Blob | null;
  device: GPUDevice | null;
  pipeline: GPURenderPipeline | null;
  fileItem: FileItem | null;
  width: number;
  height: number;
  quality: number;
}) {
  const { blob, device, pipeline, fileItem, width, height, quality } = input;
  if (!blob) {
    return emptyAtom as unknown as ReturnType<typeof queryAtom<string | null>>;
  }
  const namespace = `thumbnail:${String(width)}x${String(height)}:${String(quality)}:${device ? "gpu" : "cpu"}:${pipeline ? "pipe" : "-"}`;
  return queryAtom<string | null>(namespace, [blob], () =>
    renderThumbnail({
      device,
      pipeline,
      blob,
      fileItem,
      width,
      height,
      quality,
    }),
  );
}
