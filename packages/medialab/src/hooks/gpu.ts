import { createContext, use, useMemo } from 'react'

export const GpuAdapterContext = createContext<GPUAdapter | null>(null)
export const GpuDeviceContext = createContext<GPUDevice | null>(null)

export function useGpuAdapter() {
  return use(GpuAdapterContext)
}

export function useGpuDevice() {
  return use(GpuDeviceContext)
}

export function useGPUSupport() {
  return useMemo(() => {
    return typeof navigator !== 'undefined' && 'gpu' in navigator
  }, [])
}

export function useGpuFormat() {
  const isSupported = useGPUSupport()
  return useMemo(() => {
    if (!isSupported)
      return null

    return navigator.gpu.getPreferredCanvasFormat()
  }, [isSupported])
}
