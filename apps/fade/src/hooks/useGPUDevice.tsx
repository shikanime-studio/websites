/// <reference types="@webgpu/types" />
import { useQuery } from "@tanstack/react-query";
import { getWebGPUDevice } from "../lib/gpu";

export function useGPUDevice() {
  return useQuery({
    queryKey: ["webgpu-device"],
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      return await getWebGPUDevice();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
