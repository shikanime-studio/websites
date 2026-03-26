import { ExifDataView as n } from "./exif.js";
const s = 1380533830, f = 1464156752, h = 1163413830;
class g extends DataView {
  getExif() {
    let t = 0;
    for (this.byteLength > 11 && this.getUint32(t) === s && this.getUint32(t + 8) === f && (t += 12); t < this.byteLength && !(t + 8 > this.byteLength); ) {
      const i = this.getUint32(t), e = this.getUint32(t + 4, !0);
      if (i === h)
        return new n(
          this.buffer,
          this.byteOffset + t + 8,
          e
        );
      t += 8 + e, e % 2 !== 0 && (t += 1);
    }
    return null;
  }
}
export {
  h as ExifMarker,
  s as RiffMarker,
  g as WebPDataView,
  f as WebPMarker
};
//# sourceMappingURL=webp.js.map
