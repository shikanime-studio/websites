import { JpegDataView as S } from "./jpeg.js";
import { TiffDataView as p, sizeOfFieldType as b, isContainerFieldType as M } from "./tiff.js";
const P = 84, T = 88, w = 92, v = 96, U = 100, I = 104, W = 4096, B = 4097, L = 4098, A = 4099, R = 4100, C = 4101, F = 4102, N = 4106, O = 4107, V = 4110, E = 4111, H = 4112, D = 4113, x = 4128, j = 4129, X = 4130, k = 4131, z = 4144, G = 4145, J = 4146, Y = 4147, K = 4148, Q = 4151, Z = 4160, q = 4161, _ = 4164, $ = 4165, tt = 4167, et = 273, ct = 0, ut = 1, lt = 2, ft = 3, gt = 4, ht = 5, dt = 6, yt = 130, mt = 132, St = 32768, pt = 65535, bt = 0, Mt = 1, Pt = 2, Tt = 256, wt = 512, vt = 768, Ut = 769, It = 770, Wt = 771, Bt = 772, Lt = 1024, At = 1280, Rt = 1536, Ct = 3840, Ft = 3841, Nt = 3842, Ot = 3843, Vt = 3844, Et = 4080, Ht = 0, Dt = 128, xt = 256, jt = 384, Xt = 256, kt = 512, zt = 768, Gt = 768, Jt = 769, Yt = 770, Kt = 771, Qt = 784, Zt = 1024, qt = 1280, _t = 1280, $t = 32768, te = 32769, ee = 32770, ne = 32771, se = 32768, oe = 0, re = 256, ae = 512, ie = 256, ce = 512, ue = 32768, le = 64, fe = 128, ge = 256, he = 0, de = 1, ye = 2, me = 3, Se = 4, pe = 129, be = 130, Me = 131, Pe = 132, Te = 0, we = 1, ve = 2, Ue = 3, Ie = 4, We = 5, Be = 6, Le = 7, Ae = 8, Re = 9, Ce = 10, Fe = 11, Ne = 12, Oe = 13, Ve = 14, Ee = 15, He = 16, De = 17, xe = 18, je = 19, Xe = 20, ke = 21, ze = 22, Ge = 23, Je = 24, Ye = 25, Ke = 26, Qe = 27, Ze = 28, qe = 29, _e = 30, $e = 31, tn = 256, en = 512, nn = 768, sn = 256, on = 512, rn = 768, an = 0, cn = 1;
class nt extends DataView {
  getString(s, t) {
    const n = new Uint8Array(this.buffer, this.byteOffset + s, t);
    let e = t;
    for (; e > 0 && n[e - 1] === 0; ) e--;
    return new TextDecoder().decode(n.subarray(0, e));
  }
  getTagEntry(s) {
    const t = this.getUint16(s, !1), n = this.getUint16(s + 2, !1), e = s + 4;
    switch (t) {
      case W:
        return {
          tagId: t,
          value: this.getString(e, n)
        };
      case B:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case L:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case A:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case R:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case C:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case F:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case N:
        return {
          tagId: t,
          value: [
            this.getUint16(e, !1),
            this.getUint16(e + 2, !1)
          ]
        };
      case O:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case V:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case E:
        return {
          tagId: t,
          value: this.getUint32(e, !1)
        };
      case H:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case D:
        return {
          tagId: t,
          value: this.getInt16(e, !1)
        };
      case x:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case j:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case X:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case k:
        return {
          tagId: t,
          value: [
            this.getUint16(e, !1),
            this.getUint16(e + 2, !1)
          ]
        };
      case z:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case G:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case J:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case Y:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case K:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case Q:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case Z:
        return {
          tagId: t,
          value: this.getInt32(e, !1)
        };
      case q:
        return {
          tagId: t,
          value: this.getInt32(e, !1)
        };
      case _:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case $:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case tt:
        return {
          tagId: t,
          value: this.getUint16(e, !1)
        };
      case et:
        return {
          tagId: t,
          value: [
            this.getUint16(e, !1),
            this.getUint16(e + 2, !1)
          ]
        };
      default:
        return { tagId: t, value: null };
    }
  }
  getTagEntries() {
    const s = this.getUint32(0, !1);
    let t = 4;
    const n = [];
    for (let e = 0; e < s; e++) {
      const o = this.getUint16(t + 2, !1), a = this.getTagEntry(t);
      a.value !== null && n.push(a), t += 4 + o;
    }
    return n;
  }
}
class m extends p {
  getImageWidth(s, t) {
    const n = this.getTagValues(s, 256, t);
    return typeof n == "number" ? n : null;
  }
  getImageLength(s, t) {
    const n = this.getTagValues(s, 257, t);
    return typeof n == "number" ? n : null;
  }
  getBitsPerSample(s, t) {
    const n = this.getTagValues(s, 258, t);
    return typeof n == "number" ? n : Array.isArray(n) && typeof n[0] == "number" ? n[0] : null;
  }
  getCompression(s, t) {
    const n = this.getTagValues(s, 259, t);
    return typeof n == "number" ? n : null;
  }
  getStripOffsets(s, t) {
    return this.getNumberArrayTag(s, 273, t);
  }
  getRowsPerStrip(s, t) {
    const n = this.getTagValues(s, 278, t);
    return typeof n == "number" ? n : null;
  }
  getStripByteCounts(s, t) {
    return this.getNumberArrayTag(s, 279, t);
  }
  getFirstIfdOffset(s) {
    const t = this.getUint32(4, s);
    return t < 8 || t + 2 > this.byteLength ? null : t;
  }
  getNumberArrayTag(s, t, n) {
    const e = this.getTagValues(s, t, n);
    return typeof e == "number" ? [e] : Array.isArray(e) && e.every((o) => typeof o == "number") ? e : null;
  }
  getTagValues(s, t, n) {
    const e = this.getUint16(s, n), o = s + 2, a = 2 + e * 12 + 4;
    if (s + a > this.byteLength)
      return null;
    for (let i = 0; i < e; i++) {
      const c = o + i * 12, u = this.getTagHeader(c, n);
      if (u.tagId !== t)
        continue;
      const l = b(u.type);
      if (l <= 0 || u.count <= 0)
        return null;
      const f = l * u.count, g = f <= 4 ? c + 8 : this.getUint32(c + 8, n);
      if (g + f > this.byteLength)
        return null;
      if (M(u.type))
        return this.getContainer(g, u.type, u.count);
      if (u.count === 1)
        return this.getValue(g, u.type, n);
      const h = [];
      for (let d = 0; d < u.count; d++) {
        const y = this.getValue(
          g + d * l,
          u.type,
          n
        );
        if (typeof y != "number")
          return null;
        h.push(y);
      }
      return h;
    }
    return null;
  }
  joinStrips(s, t) {
    if (s.length !== t.length)
      return null;
    const n = t.reduce((a, i) => a + i, 0);
    if (n <= 0)
      return null;
    const e = new Uint8Array(n);
    let o = 0;
    for (let a = 0; a < s.length; a++) {
      const i = s[a], c = t[a];
      if (i + c > this.byteLength)
        return null;
      e.set(
        new Uint8Array(this.buffer, this.byteOffset + i, c),
        o
      ), o += c;
    }
    return e;
  }
}
class st {
  constructor(s) {
    this.raf = s;
  }
  getHeader() {
    const s = this.raf.getUint32(w, !1), t = this.raf.getUint32(v, !1);
    if (s <= 0 || t <= 0)
      return null;
    const n = this.raf.byteOffset + s;
    return n + t > this.raf.buffer.byteLength ? null : new nt(this.raf.buffer, n, t);
  }
  getPayload() {
    const s = this.raf.getUint32(U, !1), t = this.raf.getUint32(I, !1);
    if (s <= 0 || t <= 0)
      return null;
    const n = this.raf.byteOffset + s;
    return n + t > this.raf.buffer.byteLength ? null : new m(this.raf.buffer, n, t);
  }
}
class ot extends DataView {
  getJpegImage() {
    const s = this.getUint32(P, !1), t = this.getUint32(T, !1);
    if (s <= 0 || t <= 0)
      return null;
    const n = this.byteOffset + s;
    return n + t > this.buffer.byteLength ? null : new S(this.buffer, n, t);
  }
  getCfa() {
    return new st(this);
  }
}
async function un(r) {
  const s = await r.handle.getFile();
  return r.mimeType === "image/x-fujifilm-raf" ? new ot(await s.arrayBuffer()) : null;
}
function rt(r, s, t) {
  const n = new Uint16Array(t);
  let e = 0;
  for (let o = 0; o < t; o++) {
    let a = 0;
    for (let i = 0; i < s; i++) {
      const c = e + i, u = c >> 3, l = 7 - (c & 7), f = r[u] >> l & 1;
      a = a << 1 | f;
    }
    n[o] = a, e += s;
  }
  return n;
}
function ln(r, s, t) {
  if (r.byteLength < 8)
    return null;
  const n = new m(r.buffer, r.byteOffset, r.byteLength), e = n.getLittleEndian(), o = n.getFirstIfdOffset(e);
  if (!o)
    return null;
  const a = n.getImageWidth(o, e), i = n.getImageLength(o, e);
  if (!a || !i || s !== void 0 && s !== a || t !== void 0 && t !== i)
    return null;
  const c = n.getBitsPerSample(o, e);
  if (!c || n.getCompression(o, e) !== 1)
    return null;
  const l = n.getStripOffsets(o, e), f = n.getStripByteCounts(o, e);
  if (!l || !f)
    return null;
  const g = n.joinStrips(l, f);
  return g ? {
    bitsPerSample: c,
    swapEndian: !e && c === 16,
    data: g
  } : null;
}
function fn(r, s, t) {
  const n = s * t;
  if (r.bitsPerSample === 16) {
    const e = r.data;
    if (e.byteLength < n * 2)
      return null;
    const o = new Uint16Array(n), a = new DataView(e.buffer, e.byteOffset, e.byteLength);
    for (let i = 0; i < n; i++) {
      const c = a.getUint16(i * 2, !0);
      o[i] = r.swapEndian ? (c & 255) << 8 | (c & 65280) >> 8 : c;
    }
    return o;
  }
  return r.bitsPerSample > 0 && r.bitsPerSample < 16 ? rt(r.data, r.bitsPerSample, n) : null;
}
export {
  X as AFModeTagId,
  ne as AcrosGreenFilterSaturation,
  te as AcrosRedFilterSaturation,
  $t as AcrosSaturation,
  ee as AcrosYellowFilterSaturation,
  Ae as AntiBlurPictureMode,
  tn as AperturePriorityAEPictureMode,
  Pt as AutoAmbiancePriorityWhiteBalance,
  an as AutoEXRAuto,
  Te as AutoPictureMode,
  bt as AutoWhiteBalance,
  Mt as AutoWhitePriorityWhiteBalance,
  Kt as BWGreenFilterSaturation,
  Jt as BWRedFilterSaturation,
  Qt as BWSepiaSaturation,
  Yt as BWYellowFilterSaturation,
  xe as BabyPictureMode,
  Qe as BeachPictureMode,
  Re as BeachSnowPictureMode,
  st as CfaDataView,
  nt as CfaHeaderDataView,
  v as CfaHeaderLength,
  w as CfaHeaderOffset,
  I as CfaLength,
  U as CfaOffset,
  m as CfaPayloadDataView,
  E as ClarityTagId,
  wt as CloudyWhiteBalance,
  C as ColorTemperatureTagId,
  F as Contrast2TagId,
  R as ContrastTagId,
  Ft as Custom2WhiteBalance,
  Nt as Custom3WhiteBalance,
  Ot as Custom4WhiteBalance,
  Vt as Custom5WhiteBalance,
  Ct as CustomWhiteBalance,
  rn as DREXRMode,
  Ut as DayWhiteFluorescentWhiteBalance,
  vt as DaylightFluorescentWhiteBalance,
  Tt as DaylightWhiteBalance,
  _ as DigitalZoomTagId,
  et as DimensionsTagId,
  Y as EXRAutoTagId,
  K as EXRModeTagId,
  J as ExposureCountTagId,
  ue as FilmSimulationContrast,
  se as FilmSimulationSaturation,
  St as FilmSimulationSharpness,
  Je as FireworksPictureMode,
  D as FlashExposureCompTagId,
  At as FlashWhiteBalance,
  _e as Flower2PictureMode,
  Oe as FlowerPictureMode,
  j as FocusModeTagId,
  k as FocusPixelTagId,
  H as FujiFlashModeTagId,
  He as GoerzPictureMode,
  tt as GrainEffectTagId,
  sn as HREXRMode,
  gt as HardSharpness,
  dt as HardestSharpness,
  ae as HighContrast,
  Xt as HighSaturation,
  jt as HighestSaturation,
  q as HighlightToneTagId,
  Lt as IncandescentWhiteBalance,
  T as JpegImageLength,
  P as JpegImageOffset,
  Et as KelvinWhiteBalance,
  Xe as Landscape2PictureMode,
  ve as LandscapePictureMode,
  $ as LensModulationOptimizerTagId,
  Bt as LivingRoomWarmWhiteFluorescentWhiteBalance,
  Zt as Low2Saturation,
  ce as LowContrast,
  le as LowNoiseReduction,
  zt as LowSaturation,
  _t as LowestSaturation,
  Ue as MacroPictureMode,
  x as MacroTagId,
  cn as ManualEXRAuto,
  nn as ManualExposurePictureMode,
  mt as MediumHardSharpness,
  re as MediumHighContrast,
  Dt as MediumHighSaturation,
  ie as MediumLowContrast,
  kt as MediumLowSaturation,
  yt as MediumSoftSharpness,
  ye as MediumStrongNoiseReduction2,
  be as MediumWeakNoiseReduction2,
  Q as MultipleExposureTagId,
  Fe as MuseumPictureMode,
  ge as NANoiseReduction,
  pt as NASharpness,
  Le as NaturalLightPictureMode,
  Ee as NaturalLightWithFlashPictureMode,
  Ge as NightPortraitPictureMode,
  ze as NightScene2PictureMode,
  We as NightScenePictureMode,
  V as NoiseReduction2TagId,
  O as NoiseReductionTagId,
  Gt as NoneBWSaturation,
  oe as NormalContrast,
  fe as NormalNoiseReduction,
  he as NormalNoiseReduction2,
  Ht as NormalSaturation,
  ft as NormalSharpness,
  ke as PanoramaPictureMode,
  qe as Party2PictureMode,
  Ne as PartyPictureMode,
  G as PictureModeTagId,
  De as Portrait2PictureMode,
  we as PortraitPictureMode,
  Be as ProgramAEPictureMode,
  W as QualityTagId,
  ot as RafDataView,
  on as SNEXRMode,
  A as SaturationTagId,
  Z as ShadowToneTagId,
  B as SharpnessTagId,
  en as ShutterPriorityAEPictureMode,
  z as SlowSyncTagId,
  je as SmileShotPictureMode,
  Ke as SnowPictureMode,
  lt as SoftSharpness,
  ct as SoftestSharpness,
  Ie as SportsPictureMode,
  de as StrongNoiseReduction2,
  Se as StrongestNoiseReduction2,
  Ye as Sunset2PictureMode,
  Ce as SunsetPictureMode,
  $e as Text2PictureMode,
  Ve as TextPictureMode,
  Ze as UnderwaterPictureMode,
  Rt as UnderwaterWhiteBalance,
  ht as VeryHardSharpness,
  xt as VeryHighSaturation,
  qt as VeryLowSaturation,
  ut as VerySoftSharpness,
  me as VeryStrongNoiseReduction2,
  Me as VeryWeakNoiseReduction2,
  Wt as WarmWhiteFluorescentWhiteBalance,
  pe as WeakNoiseReduction2,
  Pe as WeakestNoiseReduction2,
  N as WhiteBalanceFineTuneTagId,
  L as WhiteBalanceTagId,
  It as WhiteFluorescentWhiteBalance,
  un as createRafDataView,
  fn as decodeRafRasterToU16,
  ln as getRafRasterFromPayload
};
//# sourceMappingURL=raf.js.map
