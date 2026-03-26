import type { ReactNode } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { GpuAdapterContext, GpuDeviceContext, useGpuAdapter } from '../hooks/gpu'

export interface GpuAdapterProviderProps {
  children: ReactNode
  options?: GPURequestAdapterOptions | undefined
}

export function GpuAdapterProvider({
  children,
  options,
}: GpuAdapterProviderProps) {
  const result = useSuspenseQuery({
    queryKey: ['gpu', 'adapter', options],
    queryFn: async () => navigator.gpu.requestAdapter(options),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  return (
    <GpuAdapterContext value={result}>
      {children}
    </GpuAdapterContext>
  )
}

export interface GpuDeviceProviderProps {
  children: ReactNode
  options?: GPUDeviceDescriptor | undefined
}

export function GpuDeviceProvider({
  children,
  options,
}: GpuDeviceProviderProps) {
  const queryClient = useQueryClient()
  const { data: adapter } = useGpuAdapter()

  const result = useSuspenseQuery({
    queryKey: ['gpu', 'device', adapter, options],
    queryFn: async () => adapter?.requestDevice(options) ?? null,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  useEffect(() => {
    result?.data?.lost.then(() => {
      return queryClient.invalidateQueries({
        queryKey: ['gpu', 'device', adapter, options],
      })
    }).catch(() => {
      return queryClient.invalidateQueries({
        queryKey: ['gpu', 'device', adapter, options],
      })
    })
  }, [result?.data, adapter, queryClient, options])

  return (
    <GpuDeviceContext value={result}>
      {children}
    </GpuDeviceContext>
  )
}
