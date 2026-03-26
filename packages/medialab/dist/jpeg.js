import { ExifDataView as n } from "./exif.js";
const r = 65496, h = 65505, a = 1165519206, f = 0, s = 65280;
class b extends DataView {
  getExif() {
    let t = 0;
    for (this.byteLength > 1 && this.getUint16(t) === r && (t += 2); t < this.byteLength && !(t + 1 >= this.byteLength); ) {
      const i = this.getUint16(t);
      if (t += 2, i === h) {
        if (t + 1 >= this.byteLength)
          break;
        const e = this.getUint16(t);
        if (this.getUint32(t + 2) === a && this.getUint16(t + 6) === f)
          return new n(
            this.buffer,
            this.byteOffset + t + 8,
            e - 8
          );
        t += e;
      } else {
        if ((i & s) !== s || t + 1 >= this.byteLength)
          break;
        const e = this.getUint16(t);
        t += e;
      }
    }
    return null;
  }
}
export {
  h as APP1Marker,
  a as ExifHeaderMarker,
  b as JpegDataView,
  s as PrefixMarker,
  r as SOIMarker,
  f as ZeroMarker
};
//# sourceMappingURL=jpeg.js.map
