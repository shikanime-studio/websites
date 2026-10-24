import { nullableAtom, queryAtom } from "./atoms";

const SUPPORT_KEYS = { yes: {}, no: {} } as const;

export const gpuAdapterAtom = (isSupported: boolean) =>
  queryAtom<GPUAdapter | null>(
    "gpu:adapter",
    [SUPPORT_KEYS[isSupported ? "yes" : "no"]],
    async () => {
      if (!isSupported) {
        console.warn("GPU not supported");
        return null;
      }
      return await navigator.gpu.requestAdapter();
    },
  );

export const gpuDeviceAtom = (adapter: GPUAdapter | null) =>
  nullableAtom<GPUDevice>(adapter, "gpu:device", async () =>
    adapter ? adapter.requestDevice() : null,
  );

export const gpuFormatAtom = (device: GPUDevice | null) =>
  nullableAtom<GPUTextureFormat>(device, "gpu:format", async () =>
    device ? navigator.gpu.getPreferredCanvasFormat() : null,
  );
