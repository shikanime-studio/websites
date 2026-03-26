import { TiffDataView as d } from "./tiff.js";
const I = 271, T = 272, c = 34665, l = 33434, u = 33437, h = 34855, p = 36867, E = 37386, O = 42035;
class m extends d {
  getTagEntries() {
    const s = [], i = this.getLittleEndian(), o = this.getFirstIfdOffset(i);
    if (!o)
      return s;
    const n = [o], a = /* @__PURE__ */ new Set();
    for (; n.length > 0; ) {
      const t = n.pop();
      if (t === void 0)
        break;
      if (a.has(t))
        continue;
      a.add(t);
      const f = this.getIfdEntries(t, i);
      for (const e of f)
        s.push(e), e.tagId === c && typeof e.value == "number" && n.push(e.value);
    }
    return s;
  }
}
export {
  p as DateTimeOriginalTagId,
  m as ExifDataView,
  c as ExifOffsetTagId,
  l as ExposureTimeTagId,
  u as FNumberTagId,
  E as FocalLengthTagId,
  h as ISOTagId,
  O as LensModelTagId,
  I as MakeTagId,
  T as ModelTagId
};
//# sourceMappingURL=exif.js.map
