import { j as a } from "../jsx-runtime-DXgJBoQh.mjs";
import { useSuspenseQuery as n } from "@tanstack/react-query";
import { useGPUSupport as p, GpuAdapterContext as i } from "../hooks/gpu.js";
function d({
  children: t,
  options: e
}) {
  const r = p(), { data: u } = n({
    queryKey: ["gpu", "adapter", r, e],
    queryFn: async () => r ? await navigator.gpu.requestAdapter(e) : null,
    staleTime: 1 / 0,
    gcTime: 1 / 0,
    refetchOnWindowFocus: !1,
    retry: !1
  });
  return /* @__PURE__ */ a.jsx(i, { value: u, children: t });
}
export {
  d as GpuAdapterProvider
};
//# sourceMappingURL=GpuAdapterProvider.js.map
