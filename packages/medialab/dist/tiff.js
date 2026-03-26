const p = 18761, F = 19789, U = 42, L = 1, b = 2, I = 3, C = 4, S = 5, m = 9, O = 10;
function d(a) {
  switch (a) {
    case 1:
    case 2:
      return 1;
    case 3:
      return 2;
    case 4:
    case 9:
      return 4;
    case 5:
    case 10:
      return 8;
    default:
      return 0;
  }
}
function T(a) {
  return a === 2 || a === 1;
}
class A extends DataView {
  setEndianness(t) {
    this.setUint16(0, t, !0);
  }
  setMagicNumber(t = 42) {
    this.setUint16(2, t, !0);
  }
  setFirstIfdOffset(t = 8) {
    this.setUint32(4, t, !0);
  }
  getAscii(t, e) {
    let n = "";
    for (let i = 0; i < e; i++) {
      const s = this.getUint8(t + i);
      if (s === 0)
        break;
      n += String.fromCharCode(s);
    }
    return n.trim();
  }
  setAscii(t, e, n) {
    const i = new Uint8Array(this.buffer, this.byteOffset + t, n);
    i.fill(0);
    const s = Math.min(n, e.length);
    for (let r = 0; r < s; r++)
      i[r] = e.charCodeAt(r) & 255;
  }
  getRational(t, e) {
    const n = this.getUint32(t, e), i = this.getUint32(t + 4, e);
    return n / i;
  }
  getSRational(t, e) {
    const n = this.getInt32(t, e), i = this.getInt32(t + 4, e);
    return n / i;
  }
  getEndianness() {
    return this.getUint16(0, !0);
  }
  getLittleEndian() {
    return this.getEndianness() === 18761;
  }
  getMagicNumber(t = this.getLittleEndian()) {
    return this.getUint16(2, t);
  }
  getFirstIfdOffset(t = this.getLittleEndian()) {
    const e = this.getUint32(4, t);
    return e < 8 || e + 2 > this.byteLength ? null : e;
  }
  getIfdEntryCount(t, e = this.getLittleEndian()) {
    return t < 8 || t + 2 > this.byteLength ? null : this.getUint16(t, e);
  }
  getIfdEntryOffset(t, e) {
    return t + 2 + e * 12;
  }
  getIfdNextOffset(t, e = this.getLittleEndian()) {
    const n = this.getIfdEntryCount(t, e);
    if (n === null)
      return null;
    const i = t + 2 + n * 12;
    return i + 4 > this.byteLength ? null : this.getUint32(i, e);
  }
  getIfdEntries(t, e = this.getLittleEndian()) {
    const n = this.getIfdEntryCount(t, e);
    if (n === null)
      return [];
    const i = 2 + n * 12 + 4;
    if (t + i > this.byteLength)
      return [];
    const s = [];
    for (let r = 0; r < n; r++) {
      const g = this.getIfdEntryOffset(t, r);
      s.push(this.getTagEntry(g, e));
    }
    return s;
  }
  getIfdTagValues(t, e, n = this.getLittleEndian()) {
    const i = this.getIfdEntryCount(t, n);
    if (i === null)
      return null;
    const s = 2 + i * 12 + 4;
    if (t + s > this.byteLength)
      return null;
    for (let r = 0; r < i; r++) {
      const g = this.getIfdEntryOffset(t, r), u = this.getTagHeader(g, n);
      if (u.tagId !== e)
        continue;
      const h = d(u.type);
      if (h <= 0 || u.count <= 0)
        return null;
      const y = h * u.count, o = y <= 4 ? g + 8 : this.getUint32(g + 8, n);
      if (o + y > this.byteLength)
        return null;
      if (T(u.type))
        return this.getContainer(o, u.type, u.count);
      if (u.count === 1)
        return this.getValue(o, u.type, n);
      const l = [];
      for (let c = 0; c < u.count; c++) {
        const f = this.getValue(
          o + c * h,
          u.type,
          n
        );
        if (typeof f != "number")
          return null;
        l.push(f);
      }
      return l;
    }
    return null;
  }
  getIfdTagNumberArray(t, e, n = this.getLittleEndian()) {
    const i = this.getIfdTagValues(t, e, n);
    return typeof i == "number" ? [i] : Array.isArray(i) && i.every((s) => typeof s == "number") ? i : null;
  }
  getTagHeader(t, e) {
    return {
      tagId: this.getUint16(t, e),
      type: this.getUint16(t + 2, e),
      count: this.getUint32(t + 4, e)
    };
  }
  setTagHeader(t, e, n, i, s) {
    this.setUint16(t, e, s), this.setUint16(t + 2, n, s), this.setUint32(t + 4, i, s);
  }
  setTagValueOrOffset(t, e, n) {
    this.setUint32(t + 8, e, n);
  }
  setTagEntry(t, e, n, i, s, r) {
    this.setTagHeader(t, e, n, i, r), this.setTagValueOrOffset(t, s, r);
  }
  setShortArray(t, e, n) {
    for (let i = 0; i < e.length; i++)
      this.setUint16(t + i * 2, e[i], n);
  }
  getValue(t, e, n) {
    switch (e) {
      case 3:
        return this.getUint16(t, n);
      case 4:
        return this.getUint32(t, n);
      case 5:
        return this.getRational(t, n);
      case 10:
        return this.getSRational(t, n);
      default:
        return null;
    }
  }
  getContainer(t, e, n) {
    switch (e) {
      case 2:
        return this.getAscii(t, n);
      case 1:
        return this.buffer.slice(
          this.byteOffset + t,
          this.byteOffset + t + n
        );
      default:
        return null;
    }
  }
  getTagEntry(t, e) {
    const { tagId: n, type: i, count: s } = this.getTagHeader(t, e), g = d(i) * s;
    let u = t + 8;
    g > 4 && (u = this.getUint32(t + 8, e));
    const h = T(i) ? this.getContainer(u, i, s) : this.getValue(u, i, e);
    return {
      tagId: n,
      value: h
    };
  }
  setIfdEntryCount(t, e, n = !0) {
    this.setUint16(t, e, n);
  }
  setIfdEntry(t, e, n, i, s, r, g = !0) {
    const u = t + 2 + e * 12;
    this.setTagEntry(u, n, i, s, r, g);
  }
  setIfdNextOffset(t, e, n, i = !0) {
    this.setUint32(t + 2 + e * 12, n, i);
  }
}
export {
  b as AsciiFieldType,
  F as BigEndianness,
  L as ByteFieldType,
  p as LittleEndianness,
  C as LongFieldType,
  S as RationalFieldType,
  m as SLongFieldType,
  O as SRationalFieldType,
  I as ShortFieldType,
  A as TiffDataView,
  U as TiffMagicNumber,
  T as isContainerFieldType,
  d as sizeOfFieldType
};
//# sourceMappingURL=tiff.js.map
