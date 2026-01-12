import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { WebGPUContext, useWebGPUSupport } from "../hooks/useWebGPU";
import type { ReactNode } from "react";

export function WebGPUProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const isWebGPUSupported = useWebGPUSupport();

  const { data: adapter } = useSuspenseQuery({
    queryKey: ["webgpu", "adapter"],
    queryFn: async () => {
      if (!isWebGPUSupported) {
        alert("WebGPU not supported");
        return null;
      }
      return await navigator.gpu.requestAdapter();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: device } = useSuspenseQuery({
    queryKey: ["webgpu", "device", adapter?.info.device],
    queryFn: async () => {
      if (!adapter) return null;
      return await adapter.requestDevice();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (!device) return;

    const onLost = (info: GPUDeviceLostInfo) => {
      alert(`WebGPU device lost: ${info.reason}`);
      return queryClient.invalidateQueries({
        queryKey: ["webgpu", "device", adapter?.info.device],
      });
    };

    device.lost.then(onLost).catch(() => {
      alert("WebGPU device lost unexpectedly");
    });
  }, [device, queryClient, adapter?.info.device]);

  return (
    <WebGPUContext.Provider
      value={{
        device,
        adapter,
        isSupported: isWebGPUSupported,
      }}
    >
      {children}
    </WebGPUContext.Provider>
  );
}
