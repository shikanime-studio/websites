import { useToast } from "@astryxdesign/core/Toast";
import { useAtomRefresh, useAtomSuspense, useAtomValue } from "@effect/atom-react";
import { useEffect } from "react";
import {
  gpuAdapterAtom,
  gpuDeviceAtom,
  gpuFormatAtom,
  gpuSupportedAtom,
} from "../lib/gpu-graph";

export interface GPUState {
  device: GPUDevice | null;
  adapter: GPUAdapter | null;
  format: GPUTextureFormat | null;
  isSupported: boolean;
}

export function useGPU(): GPUState {
  const device = useAtomSuspense(gpuDeviceAtom).value;
  const refreshDevice = useAtomRefresh(gpuDeviceAtom);
  const toast = useToast();

  useEffect(() => {
    if (!device) return;
    const onLost = () => {
      toast({ body: "The graphics device was lost. Retrying…", type: "error" });
      refreshDevice();
    };
    void device.lost.then(onLost).catch(() => {
      toast({ body: "The graphics device was lost unexpectedly.", type: "error" });
    });
  }, [device, refreshDevice, toast]);

  return {
    adapter: useAtomSuspense(gpuAdapterAtom).value,
    format: useAtomSuspense(gpuFormatAtom).value,
    isSupported: useAtomValue(gpuSupportedAtom),
    device,
  };
}
