import type { ReactNode } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { GPUContext, useGPUSupport } from '../hooks/useGPU'

export function GPUProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const isSupported = useGPUSupport()

  const { data: adapter } = useSuspenseQuery({
    queryKey: ['gpu', 'adapter'],
    queryFn: async () => {
      if (!isSupported) {
        console.warn('GPU not supported')
        return null
      }
      return await navigator.gpu.requestAdapter()
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const { data: device } = useSuspenseQuery({
    queryKey: ['gpu', 'device', adapter?.info.device],
    queryFn: async () => {
      if (!adapter)
        return null
      return await adapter.requestDevice()
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const { data: format } = useSuspenseQuery({
    queryKey: ['gpu', 'format'],
    queryFn: () => {
      if (!device)
        return null
      return navigator.gpu.getPreferredCanvasFormat()
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })

  useEffect(() => {
    if (!device)
      return

    const onLost = (info: GPUDeviceLostInfo) => {
      console.error(`GPU device lost: ${info.reason}`)
      return queryClient.invalidateQueries({
        queryKey: ['gpu', 'device', adapter?.info.device],
      })
    }

    device.lost.then(onLost).catch(() => {
      console.error('GPU device lost unexpectedly')
    })
  }, [device, queryClient, adapter?.info.device])

  return (
    <GPUContext
      value={{
        device,
        adapter,
        format,
        isSupported,
      }}
    >
      {children}
    </GPUContext>
  )
}
