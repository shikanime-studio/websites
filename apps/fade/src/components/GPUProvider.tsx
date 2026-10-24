import type { ReactNode } from "react";
import { useAtomRefresh, useAtomSuspense } from "@effect/atom-react";
import { useEffect, useMemo } from "react";
import { GPUContext, useGPUSupport } from "../hooks/useGPU";
import { gpuAdapterAtom, gpuDeviceAtom, gpuFormatAtom } from "../lib/gpu-atoms";

export function GPUProvider({ children }: { children: ReactNode }) {
  const isSupported = useGPUSupport();

  const adapterAtom = gpuAdapterAtom(isSupported);
  const adapter = useAtomSuspense(adapterAtom).value;

  const deviceAtom = gpuDeviceAtom(adapter);
  const device = useAtomSuspense(deviceAtom).value;

  const formatAtom = gpuFormatAtom(device);
  const format = useAtomSuspense(formatAtom).value;

  const refreshDevice = useAtomRefresh(deviceAtom);

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
