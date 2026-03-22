import type { ReactNode } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { GpuAdapterContext, useGPUSupport } from '../hooks/gpu'

export interface GpuAdapterProviderProps {
  children: ReactNode
  options?: GPURequestAdapterOptions | undefined
}

export function GpuAdapterProvider({
  children,
  options,
}: GpuAdapterProviderProps) {
  const isSupported = useGPUSupport()

  const { data: adapter } = useSuspenseQuery({
    queryKey: ['gpu', 'adapter', isSupported, options],
    queryFn: async () => {
      if (!isSupported)
        return null

      return await navigator.gpu.requestAdapter(options)
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  return (
    <GpuAdapterContext value={adapter}>
      {children}
    </GpuAdapterContext>
  )
}
