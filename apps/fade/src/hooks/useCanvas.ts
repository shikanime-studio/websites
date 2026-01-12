import { useEffect, useState } from "react";
import { useWebGPU } from "./useWebGPU";
import type { RefObject } from "react";

export function useCanvas(ref: RefObject<HTMLCanvasElement | null>) {
  const [context, setContext] = useState<GPUCanvasContext | null>(null);
  const { device, adapter } = useWebGPU();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !device || !adapter) return;

    const ctx = canvas.getContext("webgpu");
    if (!ctx) {
      console.error("Could not get WebGPU context");
      return;
    }
    setContext(ctx);
  }, [ref, device, adapter]);

  return { device, context };
}
