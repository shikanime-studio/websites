import { useSuspenseQuery as n } from "@tanstack/react-query";
import { createImageDataView as a } from "../image.js";
import { RafDataView as f } from "../raf.js";
import { retryDelay as u } from "../utils.js";
function m(t) {
  return n({
    queryKey: ["exif", t],
    queryFn: async () => {
      if (!t)
        return null;
      const e = await a(t);
      if (!e)
        return null;
      let r = null;
      if (e instanceof f) {
        const i = e.getJpegImage();
        i && (r = i.getExif());
      } else
        r = e.getExif();
      return r ? r.getTagEntries() : null;
    },
    retry: 3,
    retryDelay: u,
    staleTime: 1 / 0
  });
}
export {
  m as useExif
};
//# sourceMappingURL=exif.js.map
