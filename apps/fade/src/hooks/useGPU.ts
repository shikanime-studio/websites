import { useAtomSuspense, useAtomValue } from "@effect/atom-react";
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
  return {
    adapter: useAtomSuspense(gpuAdapterAtom).value,
    device: useAtomSuspense(gpuDeviceAtom).value,
    format: useAtomSuspense(gpuFormatAtom).value,
    isSupported: useAtomValue(gpuSupportedAtom),
  };
}
