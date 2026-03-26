import { j as n } from "../jsx-runtime-DXgJBoQh.mjs";
import { useQueryClient as a, useSuspenseQuery as c } from "@tanstack/react-query";
import { useEffect as s } from "react";
import { useGpuAdapter as f, GpuDeviceContext as y } from "../hooks/gpu.js";
function p({
  children: i,
  options: r
}) {
  const u = a(), e = f(), { data: t } = c({
    queryKey: ["gpu", "device", e, r],
    queryFn: async () => e ? await e.requestDevice(r) : null,
    staleTime: 1 / 0,
    gcTime: 1 / 0,
    refetchOnWindowFocus: !1,
    retry: !1
  });
  return s(() => {
    t && t.lost.then(() => u.invalidateQueries({
      queryKey: ["gpu", "device", e, r]
    })).catch(() => u.invalidateQueries({
      queryKey: ["gpu", "device", e, r]
    }));
  }, [t, u, e, r]), /* @__PURE__ */ n.jsx(y, { value: t, children: i });
}
export {
  p as GpuDeviceProvider
};
//# sourceMappingURL=GpuDeviceProvider.js.map
