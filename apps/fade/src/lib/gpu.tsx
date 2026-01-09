/// <reference types="@webgpu/types" />

export function isWebGPUSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  return !!navigator.gpu;
}

export async function getWebGPUDevice(): Promise<GPUDevice | null> {
  if (!isWebGPUSupported()) return null;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return null;
    return await adapter.requestDevice();
  } catch (e) {
    console.error("WebGPU device creation failed:", e);
    return null;
  }
}
