import type { ReactNode } from "react";
import { useAtomRefresh, useAtomSuspense, useAtomValue } from "@effect/atom-react";
import { useEffect, useMemo } from "react";
import { GPUContext } from "../hooks/useGPU";
import {
  gpuAdapterAtom,
  gpuDeviceAtom,
  gpuFormatAtom,
  gpuSupportedAtom,
} from "../lib/gpu-graph";

export function GPUProvider({ children }: { children: ReactNode }) {
  const isSupported = useAtomValue(gpuSupportedAtom);

  const adapter = useAtomSuspense(gpuAdapterAtom).value;
  const device = useAtomSuspense(gpuDeviceAtom).value;
  const format = useAtomSuspense(gpuFormatAtom).value;

  const refreshDevice = useAtomRefresh(gpuDeviceAtom);

  useEffect(() => {
    if (!device) return;

    const onLost = (info: GPUDeviceLostInfo) => {
      console.error(`GPU device lost: ${info.reason}`);
      refreshDevice();
    };

    device.lost.then(onLost).catch(() => {
      console.error("GPU device lost unexpectedly");
    });
  }, [device, refreshDevice]);

  const value = useMemo(
    () => ({ adapter, device, format, isSupported }),
    [adapter, device, format, isSupported],
  );

  return <GPUContext value={value}>{children}</GPUContext>;
}
