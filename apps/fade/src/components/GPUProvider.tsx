import type { ReactNode } from "react";
import { useAtomRefresh, useAtomSuspense } from "@effect/atom-react";
import { useEffect, useMemo } from "react";
import { GPUContext, useGPUSupport } from "../hooks/useGPU";
import { nullableAtom, queryAtom } from "../lib/atoms";

const SUPPORTED_KEYS = { yes: {}, no: {} } as const;

export function GPUProvider({ children }: { children: ReactNode }) {
  const isSupported = useGPUSupport();

  const adapterAtom = useMemo(
    () =>
      queryAtom<GPUAdapter | null>(
        "gpu:adapter",
        [SUPPORTED_KEYS[isSupported ? "yes" : "no"]],
        async () => {
          if (!isSupported) {
            console.warn("GPU not supported");
            return null;
          }
          return await navigator.gpu.requestAdapter();
        },
      ),
    [isSupported],
  );
  const adapter = useAtomSuspense(adapterAtom).value;

  const deviceAtom = useMemo(
    () =>
      nullableAtom<GPUDevice>(adapter, "gpu:device", async () =>
        adapter ? adapter.requestDevice() : null,
      ),
    [adapter],
  );
  const device = useAtomSuspense(deviceAtom).value;

  const formatAtom = useMemo(
    () =>
      nullableAtom<GPUTextureFormat>(device, "gpu:format", async () =>
        device ? navigator.gpu.getPreferredCanvasFormat() : null,
      ),
    [device],
  );
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
