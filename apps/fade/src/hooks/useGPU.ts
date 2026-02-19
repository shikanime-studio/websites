import { createContext, use, useMemo } from 'react'

export function useGPUSupport() {
  return useMemo(() => {
    return typeof navigator !== 'undefined' && 'gpu' in navigator
  }, [])
}

export interface GPUContextType {
  device: GPUDevice | null
  adapter: GPUAdapter | null
  format: GPUTextureFormat | null
  isSupported: boolean
}

export const GPUContext = createContext<GPUContextType | null>(null)

export function useGPU() {
  const context = use(GPUContext)
  if (!context) {
    throw new Error('useGPU must be used within a GPUProvider')
  }
  return context
}
