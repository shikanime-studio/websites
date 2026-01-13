import { useEffect, useState } from "react";
import type { RefObject } from "react";

export function useCanvas(ref: RefObject<HTMLCanvasElement | null>) {
  const [context, setContext] = useState<GPUCanvasContext | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("webgpu");
    if (!ctx) {
      console.error("Could not get GPU context");
      return;
    }
    setContext(ctx);
  }, [ref]);

  return { context };
}
