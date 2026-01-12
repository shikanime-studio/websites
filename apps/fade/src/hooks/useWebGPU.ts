import { createContext, useContext, useMemo } from "react";

export function useWebGPUSupport() {
  return useMemo(() => {
    return typeof navigator !== "undefined" && "gpu" in navigator;
  }, []);
}

export interface WebGPUContextType {
  device: GPUDevice | null;
  adapter: GPUAdapter | null;
  isSupported: boolean;
}

export const WebGPUContext = createContext<WebGPUContextType | null>(null);

export function useWebGPU() {
  const context = useContext(WebGPUContext);
  if (!context) {
    throw new Error("useWebGPU must be used within a WebGPUProvider");
  }
  return context;
}
