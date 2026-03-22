import { createContext, use, useMemo } from 'react'

export const GpuAdapterContext = createContext<GPUAdapter | null>(null)
export const GpuDeviceContext = createContext<GPUDevice | null>(null)

export function useGpuAdapter() {
  return use(GpuAdapterContext)
}

export function useGpuDevice() {
  const adapter = useGpuAdapter()
  const device = use(GpuDeviceContext)
  return {
    adapter,
    device,
  }
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
