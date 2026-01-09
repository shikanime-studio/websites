/// <reference types="@webgpu/types" />
import { useQuery } from "@tanstack/react-query";
import { createResizeContext } from "../lib/resize";
import { useGPUDevice } from "./useGPUDevice";

export function useResize() {
  const { data: device } = useGPUDevice();

  return useQuery({
    queryKey: ["resize-context", !!device],
    queryFn: async () => {
      if (!device) return null;
      return createResizeContext(device);
    },
    enabled: !!device,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
