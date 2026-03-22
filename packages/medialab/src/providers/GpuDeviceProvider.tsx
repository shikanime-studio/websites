import type { ReactNode } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { GpuDeviceContext, useGpuAdapter } from '../hooks/gpu'

export interface GpuDeviceProviderProps {
  children: ReactNode
  options?: GPUDeviceDescriptor | undefined
}

export function GpuDeviceProvider({
  children,
  options,
}: GpuDeviceProviderProps) {
  const queryClient = useQueryClient()
  const adapter = useGpuAdapter()

  const { data: device } = useSuspenseQuery({
    queryKey: ['gpu', 'device', adapter, options],
    queryFn: async () => {
      if (!adapter)
        return null

      return await adapter.requestDevice(options)
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  useEffect(() => {
    if (!device)
      return

    device.lost.then(() => {
      return queryClient.invalidateQueries({
        queryKey: ['gpu', 'device', adapter, options],
      })
    }).catch(() => {
      return queryClient.invalidateQueries({
        queryKey: ['gpu', 'device', adapter, options],
      })
    })
  }, [device, queryClient, adapter, options])

  return (
    <GpuDeviceContext value={device}>
      {children}
    </GpuDeviceContext>
  )
}
