import { useEffect, useState } from "react";
import type { RefObject } from "react";

export function useCanvas(ref: RefObject<HTMLCanvasElement | null>) {
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const context = canvas.getContext("webgl2");
    if (!context) {
      alert("WebGL2 not supported");
      return;
    }

    setGl(context);
  }, [ref]);

  return gl;
}
