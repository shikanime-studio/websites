import { ExifDataView as i } from "./exif.js";
const n = 2303741511, s = 218765834, r = 1700284774;
class f extends DataView {
  getExif() {
    let t = 0;
    for (this.byteLength > 7 && this.getUint32(t) === n && this.getUint32(t + 4) === s && (t += 8); t < this.byteLength && !(t + 8 > this.byteLength); ) {
      const e = this.getUint32(t);
      if (this.getUint32(t + 4) === r)
        return new i(
          this.buffer,
          this.byteOffset + t + 8,
          e
        );
      t += 12 + e;
    }
    return null;
  }
}
export {
  r as ExifChunkMarker,
  f as PngDataView,
  n as Signature1Marker,
  s as Signature2Marker
};
//# sourceMappingURL=png.js.map
