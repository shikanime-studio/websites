import type { UseSuspenseQueryResult } from '@tanstack/react-query'
import { createContext, use, useMemo } from 'react'

export const GpuAdapterContext = createContext<UseSuspenseQueryResult<GPUAdapter | null, Error> | undefined>(undefined)
export const GpuDeviceContext = createContext<UseSuspenseQueryResult<GPUDevice | null, Error> | undefined>(undefined)

export function useGpuAdapter() {
  const adapter = use(GpuAdapterContext)
  if (!adapter)
    throw new Error('GPU should be called inside a GPUAdapterProvider')
  return adapter
}

export function useGpuDevice() {
  const device = use(GpuDeviceContext)
  if (!device)
    throw new Error('GPU should be called inside a GpuDeviceProvider')
  return device
}

export function useGpuFormat() {
  return useMemo(() => {
    return navigator.gpu.getPreferredCanvasFormat()
  }, [])
}
