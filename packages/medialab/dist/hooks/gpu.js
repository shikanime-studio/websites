import { createContext as t, useMemo as n, use as r } from "react";
const o = t(null), p = t(null);
function a() {
  return r(o);
}
function s() {
  const e = a(), u = r(p);
  return {
    adapter: e,
    device: u
  };
}
function i() {
  return n(() => typeof navigator < "u" && "gpu" in navigator, []);
}
function f() {
  const e = i();
  return n(() => e ? navigator.gpu.getPreferredCanvasFormat() : null, [e]);
}
export {
  o as GpuAdapterContext,
  p as GpuDeviceContext,
  i as useGPUSupport,
  a as useGpuAdapter,
  s as useGpuDevice,
  f as useGpuFormat
};
//# sourceMappingURL=gpu.js.map
