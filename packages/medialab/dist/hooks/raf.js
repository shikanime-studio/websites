import { useSuspenseQuery as ee } from "@tanstack/react-query";
import { useEffect as tn } from "react";
import { createRafDataView as rn, getRafRasterFromPayload as on, decodeRafRasterToU16 as sn } from "../raf.js";
import { useGpuDevice as un, useGpuFormat as cn } from "./gpu.js";
import { retryDelay as ne } from "../utils.js";
function f(e, n, t) {
  function r(u, c) {
    if (u._zod || Object.defineProperty(u, "_zod", {
      value: {
        def: c,
        constr: s,
        traits: /* @__PURE__ */ new Set()
      },
      enumerable: !1
    }), u._zod.traits.has(e))
      return;
    u._zod.traits.add(e), n(u, c);
    const a = s.prototype, l = Object.keys(a);
    for (let h = 0; h < l.length; h++) {
      const d = l[h];
      d in u || (u[d] = a[d].bind(u));
    }
  }
  const o = t?.Parent ?? Object;
  class i extends o {
  }
  Object.defineProperty(i, "name", { value: e });
  function s(u) {
    var c;
    const a = t?.Parent ? new i() : this;
    r(a, u), (c = a._zod).deferred ?? (c.deferred = []);
    for (const l of a._zod.deferred)
      l();
    return a;
  }
  return Object.defineProperty(s, "init", { value: r }), Object.defineProperty(s, Symbol.hasInstance, {
    value: (u) => t?.Parent && u instanceof t.Parent ? !0 : u?._zod?.traits?.has(e)
  }), Object.defineProperty(s, "name", { value: e }), s;
}
class R extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class $e extends Error {
  constructor(n) {
    super(`Encountered unidirectional transform during encode: ${n}`), this.name = "ZodEncodeError";
  }
}
const Te = {};
function Z(e) {
  return Te;
}
function Ee(e) {
  const n = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, o]) => n.indexOf(+r) === -1).map(([r, o]) => o);
}
function X(e, n) {
  return typeof n == "bigint" ? n.toString() : n;
}
function te(e) {
  return {
    get value() {
      {
        const n = e();
        return Object.defineProperty(this, "value", { value: n }), n;
      }
    }
  };
}
function re(e) {
  return e == null;
}
function oe(e) {
  const n = e.startsWith("^") ? 1 : 0, t = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(n, t);
}
function an(e, n) {
  const t = (e.toString().split(".")[1] || "").length, r = n.toString();
  let o = (r.split(".")[1] || "").length;
  if (o === 0 && /\d?e-\d?/.test(r)) {
    const c = r.match(/\d?e-(\d?)/);
    c?.[1] && (o = Number.parseInt(c[1]));
  }
  const i = t > o ? t : o, s = Number.parseInt(e.toFixed(i).replace(".", "")), u = Number.parseInt(n.toFixed(i).replace(".", ""));
  return s % u / 10 ** i;
}
const ce = /* @__PURE__ */ Symbol("evaluating");
function m(e, n, t) {
  let r;
  Object.defineProperty(e, n, {
    get() {
      if (r !== ce)
        return r === void 0 && (r = ce, r = t()), r;
    },
    set(o) {
      Object.defineProperty(e, n, {
        value: o
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function I(e, n, t) {
  Object.defineProperty(e, n, {
    value: t,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function E(...e) {
  const n = {};
  for (const t of e) {
    const r = Object.getOwnPropertyDescriptors(t);
    Object.assign(n, r);
  }
  return Object.defineProperties({}, n);
}
function ae(e) {
  return JSON.stringify(e);
}
const Ne = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function D(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const ln = te(() => {
  if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const e = Function;
    return new e(""), !0;
  } catch {
    return !1;
  }
});
function M(e) {
  if (D(e) === !1)
    return !1;
  const n = e.constructor;
  if (n === void 0 || typeof n != "function")
    return !0;
  const t = n.prototype;
  return !(D(t) === !1 || Object.prototype.hasOwnProperty.call(t, "isPrototypeOf") === !1);
}
function Ze(e) {
  return M(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const fn = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function dn(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function N(e, n, t) {
  const r = new e._zod.constr(n ?? e._zod.def);
  return (!n || t?.parent) && (r._zod.parent = e), r;
}
function _(e) {
  const n = e;
  if (!n)
    return {};
  if (typeof n == "string")
    return { error: () => n };
  if (n?.message !== void 0) {
    if (n?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    n.error = n.message;
  }
  return delete n.message, typeof n.error == "string" ? { ...n, error: () => n.error } : n;
}
function pn(e) {
  return Object.keys(e).filter((n) => e[n]._zod.optin === "optional" && e[n]._zod.optout === "optional");
}
const hn = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function mn(e, n) {
  const t = e._zod.def, r = t.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = E(e._zod.def, {
    get shape() {
      const s = {};
      for (const u in n) {
        if (!(u in t.shape))
          throw new Error(`Unrecognized key: "${u}"`);
        n[u] && (s[u] = t.shape[u]);
      }
      return I(this, "shape", s), s;
    },
    checks: []
  });
  return N(e, i);
}
function gn(e, n) {
  const t = e._zod.def, r = t.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = E(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape };
      for (const u in n) {
        if (!(u in t.shape))
          throw new Error(`Unrecognized key: "${u}"`);
        n[u] && delete s[u];
      }
      return I(this, "shape", s), s;
    },
    checks: []
  });
  return N(e, i);
}
function _n(e, n) {
  if (!M(n))
    throw new Error("Invalid input to extend: expected a plain object");
  const t = e._zod.def.checks;
  if (t && t.length > 0) {
    const i = e._zod.def.shape;
    for (const s in n)
      if (Object.getOwnPropertyDescriptor(i, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const o = E(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape, ...n };
      return I(this, "shape", i), i;
    }
  });
  return N(e, o);
}
function vn(e, n) {
  if (!M(n))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const t = E(e._zod.def, {
    get shape() {
      const r = { ...e._zod.def.shape, ...n };
      return I(this, "shape", r), r;
    }
  });
  return N(e, t);
}
function yn(e, n) {
  const t = E(e._zod.def, {
    get shape() {
      const r = { ...e._zod.def.shape, ...n._zod.def.shape };
      return I(this, "shape", r), r;
    },
    get catchall() {
      return n._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return N(e, t);
}
function bn(e, n, t) {
  const o = n._zod.def.checks;
  if (o && o.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = E(n._zod.def, {
    get shape() {
      const u = n._zod.def.shape, c = { ...u };
      if (t)
        for (const a in t) {
          if (!(a in u))
            throw new Error(`Unrecognized key: "${a}"`);
          t[a] && (c[a] = e ? new e({
            type: "optional",
            innerType: u[a]
          }) : u[a]);
        }
      else
        for (const a in u)
          c[a] = e ? new e({
            type: "optional",
            innerType: u[a]
          }) : u[a];
      return I(this, "shape", c), c;
    },
    checks: []
  });
  return N(n, s);
}
function wn(e, n, t) {
  const r = E(n._zod.def, {
    get shape() {
      const o = n._zod.def.shape, i = { ...o };
      if (t)
        for (const s in t) {
          if (!(s in i))
            throw new Error(`Unrecognized key: "${s}"`);
          t[s] && (i[s] = new e({
            type: "nonoptional",
            innerType: o[s]
          }));
        }
      else
        for (const s in o)
          i[s] = new e({
            type: "nonoptional",
            innerType: o[s]
          });
      return I(this, "shape", i), i;
    }
  });
  return N(n, r);
}
function A(e, n = 0) {
  if (e.aborted === !0)
    return !0;
  for (let t = n; t < e.issues.length; t++)
    if (e.issues[t]?.continue !== !0)
      return !0;
  return !1;
}
function je(e, n) {
  return n.map((t) => {
    var r;
    return (r = t).path ?? (r.path = []), t.path.unshift(e), t;
  });
}
function G(e) {
  return typeof e == "string" ? e : e?.message;
}
function j(e, n, t) {
  const r = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const o = G(e.inst?._zod.def?.error?.(e)) ?? G(n?.error?.(e)) ?? G(t.customError?.(e)) ?? G(t.localeError?.(e)) ?? "Invalid input";
    r.message = o;
  }
  return delete r.inst, delete r.continue, n?.reportInput || delete r.input, r;
}
function se(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function J(...e) {
  const [n, t, r] = e;
  return typeof n == "string" ? {
    message: n,
    code: "custom",
    input: t,
    inst: r
  } : { ...n };
}
const Ie = (e, n) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: n,
    enumerable: !1
  }), e.message = JSON.stringify(n, X, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, Ae = f("$ZodError", Ie), Re = f("$ZodError", Ie, { Parent: Error });
function zn(e, n = (t) => t.message) {
  const t = {}, r = [];
  for (const o of e.issues)
    o.path.length > 0 ? (t[o.path[0]] = t[o.path[0]] || [], t[o.path[0]].push(n(o))) : r.push(n(o));
  return { formErrors: r, fieldErrors: t };
}
function kn(e, n = (t) => t.message) {
  const t = { _errors: [] }, r = (o) => {
    for (const i of o.issues)
      if (i.code === "invalid_union" && i.errors.length)
        i.errors.map((s) => r({ issues: s }));
      else if (i.code === "invalid_key")
        r({ issues: i.issues });
      else if (i.code === "invalid_element")
        r({ issues: i.issues });
      else if (i.path.length === 0)
        t._errors.push(n(i));
      else {
        let s = t, u = 0;
        for (; u < i.path.length; ) {
          const c = i.path[u];
          u === i.path.length - 1 ? (s[c] = s[c] || { _errors: [] }, s[c]._errors.push(n(i))) : s[c] = s[c] || { _errors: [] }, s = s[c], u++;
        }
      }
  };
  return r(e), t;
}
const ie = (e) => (n, t, r, o) => {
  const i = r ? Object.assign(r, { async: !1 }) : { async: !1 }, s = n._zod.run({ value: t, issues: [] }, i);
  if (s instanceof Promise)
    throw new R();
  if (s.issues.length) {
    const u = new (o?.Err ?? e)(s.issues.map((c) => j(c, i, Z())));
    throw Ne(u, o?.callee), u;
  }
  return s.value;
}, ue = (e) => async (n, t, r, o) => {
  const i = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let s = n._zod.run({ value: t, issues: [] }, i);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const u = new (o?.Err ?? e)(s.issues.map((c) => j(c, i, Z())));
    throw Ne(u, o?.callee), u;
  }
  return s.value;
}, B = (e) => (n, t, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, i = n._zod.run({ value: t, issues: [] }, o);
  if (i instanceof Promise)
    throw new R();
  return i.issues.length ? {
    success: !1,
    error: new (e ?? Ae)(i.issues.map((s) => j(s, o, Z())))
  } : { success: !0, data: i.value };
}, On = /* @__PURE__ */ B(Re), L = (e) => async (n, t, r) => {
  const o = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let i = n._zod.run({ value: t, issues: [] }, o);
  return i instanceof Promise && (i = await i), i.issues.length ? {
    success: !1,
    error: new e(i.issues.map((s) => j(s, o, Z())))
  } : { success: !0, data: i.value };
}, Pn = /* @__PURE__ */ L(Re), xn = (e) => (n, t, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return ie(e)(n, t, o);
}, Sn = (e) => (n, t, r) => ie(e)(n, t, r), $n = (e) => async (n, t, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return ue(e)(n, t, o);
}, Tn = (e) => async (n, t, r) => ue(e)(n, t, r), En = (e) => (n, t, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return B(e)(n, t, o);
}, Nn = (e) => (n, t, r) => B(e)(n, t, r), Zn = (e) => async (n, t, r) => {
  const o = r ? Object.assign(r, { direction: "backward" }) : { direction: "backward" };
  return L(e)(n, t, o);
}, jn = (e) => async (n, t, r) => L(e)(n, t, r), In = /^-?\d+$/, An = /^-?\d+(?:\.\d+)?$/, $ = /* @__PURE__ */ f("$ZodCheck", (e, n) => {
  var t;
  e._zod ?? (e._zod = {}), e._zod.def = n, (t = e._zod).onattach ?? (t.onattach = []);
}), Ce = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Me = /* @__PURE__ */ f("$ZodCheckLessThan", (e, n) => {
  $.init(e, n);
  const t = Ce[typeof n.value];
  e._zod.onattach.push((r) => {
    const o = r._zod.bag, i = (n.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    n.value < i && (n.inclusive ? o.maximum = n.value : o.exclusiveMaximum = n.value);
  }), e._zod.check = (r) => {
    (n.inclusive ? r.value <= n.value : r.value < n.value) || r.issues.push({
      origin: t,
      code: "too_big",
      maximum: typeof n.value == "object" ? n.value.getTime() : n.value,
      input: r.value,
      inclusive: n.inclusive,
      inst: e,
      continue: !n.abort
    });
  };
}), Je = /* @__PURE__ */ f("$ZodCheckGreaterThan", (e, n) => {
  $.init(e, n);
  const t = Ce[typeof n.value];
  e._zod.onattach.push((r) => {
    const o = r._zod.bag, i = (n.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    n.value > i && (n.inclusive ? o.minimum = n.value : o.exclusiveMinimum = n.value);
  }), e._zod.check = (r) => {
    (n.inclusive ? r.value >= n.value : r.value > n.value) || r.issues.push({
      origin: t,
      code: "too_small",
      minimum: typeof n.value == "object" ? n.value.getTime() : n.value,
      input: r.value,
      inclusive: n.inclusive,
      inst: e,
      continue: !n.abort
    });
  };
}), Rn = /* @__PURE__ */ f("$ZodCheckMultipleOf", (e, n) => {
  $.init(e, n), e._zod.onattach.push((t) => {
    var r;
    (r = t._zod.bag).multipleOf ?? (r.multipleOf = n.value);
  }), e._zod.check = (t) => {
    if (typeof t.value != typeof n.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof t.value == "bigint" ? t.value % n.value === BigInt(0) : an(t.value, n.value) === 0) || t.issues.push({
      origin: typeof t.value,
      code: "not_multiple_of",
      divisor: n.value,
      input: t.value,
      inst: e,
      continue: !n.abort
    });
  };
}), Cn = /* @__PURE__ */ f("$ZodCheckNumberFormat", (e, n) => {
  $.init(e, n), n.format = n.format || "float64";
  const t = n.format?.includes("int"), r = t ? "int" : "number", [o, i] = hn[n.format];
  e._zod.onattach.push((s) => {
    const u = s._zod.bag;
    u.format = n.format, u.minimum = o, u.maximum = i, t && (u.pattern = In);
  }), e._zod.check = (s) => {
    const u = s.value;
    if (t) {
      if (!Number.isInteger(u)) {
        s.issues.push({
          expected: r,
          format: n.format,
          code: "invalid_type",
          continue: !1,
          input: u,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(u)) {
        u > 0 ? s.issues.push({
          input: u,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !n.abort
        }) : s.issues.push({
          input: u,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !n.abort
        });
        return;
      }
    }
    u < o && s.issues.push({
      origin: "number",
      input: u,
      code: "too_small",
      minimum: o,
      inclusive: !0,
      inst: e,
      continue: !n.abort
    }), u > i && s.issues.push({
      origin: "number",
      input: u,
      code: "too_big",
      maximum: i,
      inclusive: !0,
      inst: e,
      continue: !n.abort
    });
  };
}), Mn = /* @__PURE__ */ f("$ZodCheckMaxLength", (e, n) => {
  var t;
  $.init(e, n), (t = e._zod.def).when ?? (t.when = (r) => {
    const o = r.value;
    return !re(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    n.maximum < o && (r._zod.bag.maximum = n.maximum);
  }), e._zod.check = (r) => {
    const o = r.value;
    if (o.length <= n.maximum)
      return;
    const s = se(o);
    r.issues.push({
      origin: s,
      code: "too_big",
      maximum: n.maximum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !n.abort
    });
  };
}), Jn = /* @__PURE__ */ f("$ZodCheckMinLength", (e, n) => {
  var t;
  $.init(e, n), (t = e._zod.def).when ?? (t.when = (r) => {
    const o = r.value;
    return !re(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    n.minimum > o && (r._zod.bag.minimum = n.minimum);
  }), e._zod.check = (r) => {
    const o = r.value;
    if (o.length >= n.minimum)
      return;
    const s = se(o);
    r.issues.push({
      origin: s,
      code: "too_small",
      minimum: n.minimum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !n.abort
    });
  };
}), Gn = /* @__PURE__ */ f("$ZodCheckLengthEquals", (e, n) => {
  var t;
  $.init(e, n), (t = e._zod.def).when ?? (t.when = (r) => {
    const o = r.value;
    return !re(o) && o.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.minimum = n.length, o.maximum = n.length, o.length = n.length;
  }), e._zod.check = (r) => {
    const o = r.value, i = o.length;
    if (i === n.length)
      return;
    const s = se(o), u = i > n.length;
    r.issues.push({
      origin: s,
      ...u ? { code: "too_big", maximum: n.length } : { code: "too_small", minimum: n.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: e,
      continue: !n.abort
    });
  };
}), Un = /* @__PURE__ */ f("$ZodCheckOverwrite", (e, n) => {
  $.init(e, n), e._zod.check = (t) => {
    t.value = n.tx(t.value);
  };
});
class Dn {
  constructor(n = []) {
    this.content = [], this.indent = 0, this && (this.args = n);
  }
  indented(n) {
    this.indent += 1, n(this), this.indent -= 1;
  }
  write(n) {
    if (typeof n == "function") {
      n(this, { execution: "sync" }), n(this, { execution: "async" });
      return;
    }
    const r = n.split(`
`).filter((s) => s), o = Math.min(...r.map((s) => s.length - s.trimStart().length)), i = r.map((s) => s.slice(o)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of i)
      this.content.push(s);
  }
  compile() {
    const n = Function, t = this?.args, o = [...(this?.content ?? [""]).map((i) => `  ${i}`)];
    return new n(...t, o.join(`
`));
  }
}
const Fn = {
  major: 4,
  minor: 3,
  patch: 6
}, v = /* @__PURE__ */ f("$ZodType", (e, n) => {
  var t;
  e ?? (e = {}), e._zod.def = n, e._zod.bag = e._zod.bag || {}, e._zod.version = Fn;
  const r = [...e._zod.def.checks ?? []];
  e._zod.traits.has("$ZodCheck") && r.unshift(e);
  for (const o of r)
    for (const i of o._zod.onattach)
      i(e);
  if (r.length === 0)
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred?.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const o = (s, u, c) => {
      let a = A(s), l;
      for (const h of u) {
        if (h._zod.def.when) {
          if (!h._zod.def.when(s))
            continue;
        } else if (a)
          continue;
        const d = s.issues.length, p = h._zod.check(s);
        if (p instanceof Promise && c?.async === !1)
          throw new R();
        if (l || p instanceof Promise)
          l = (l ?? Promise.resolve()).then(async () => {
            await p, s.issues.length !== d && (a || (a = A(s, d)));
          });
        else {
          if (s.issues.length === d)
            continue;
          a || (a = A(s, d));
        }
      }
      return l ? l.then(() => s) : s;
    }, i = (s, u, c) => {
      if (A(s))
        return s.aborted = !0, s;
      const a = o(u, r, c);
      if (a instanceof Promise) {
        if (c.async === !1)
          throw new R();
        return a.then((l) => e._zod.parse(l, c));
      }
      return e._zod.parse(a, c);
    };
    e._zod.run = (s, u) => {
      if (u.skipChecks)
        return e._zod.parse(s, u);
      if (u.direction === "backward") {
        const a = e._zod.parse({ value: s.value, issues: [] }, { ...u, skipChecks: !0 });
        return a instanceof Promise ? a.then((l) => i(l, s, u)) : i(a, s, u);
      }
      const c = e._zod.parse(s, u);
      if (c instanceof Promise) {
        if (u.async === !1)
          throw new R();
        return c.then((a) => o(a, r, u));
      }
      return o(c, r, u);
    };
  }
  m(e, "~standard", () => ({
    validate: (o) => {
      try {
        const i = On(e, o);
        return i.success ? { value: i.data } : { issues: i.error?.issues };
      } catch {
        return Pn(e, o).then((s) => s.success ? { value: s.data } : { issues: s.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), Ge = /* @__PURE__ */ f("$ZodNumber", (e, n) => {
  v.init(e, n), e._zod.pattern = e._zod.bag.pattern ?? An, e._zod.parse = (t, r) => {
    if (n.coerce)
      try {
        t.value = Number(t.value);
      } catch {
      }
    const o = t.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
      return t;
    const i = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : "Infinity" : void 0;
    return t.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: e,
      ...i ? { received: i } : {}
    }), t;
  };
}), Vn = /* @__PURE__ */ f("$ZodNumberFormat", (e, n) => {
  Cn.init(e, n), Ge.init(e, n);
}), Bn = /* @__PURE__ */ f("$ZodUnknown", (e, n) => {
  v.init(e, n), e._zod.parse = (t) => t;
}), Ln = /* @__PURE__ */ f("$ZodNever", (e, n) => {
  v.init(e, n), e._zod.parse = (t, r) => (t.issues.push({
    expected: "never",
    code: "invalid_type",
    input: t.value,
    inst: e
  }), t);
});
function le(e, n, t) {
  e.issues.length && n.issues.push(...je(t, e.issues)), n.value[t] = e.value;
}
const qn = /* @__PURE__ */ f("$ZodArray", (e, n) => {
  v.init(e, n), e._zod.parse = (t, r) => {
    const o = t.value;
    if (!Array.isArray(o))
      return t.issues.push({
        expected: "array",
        code: "invalid_type",
        input: o,
        inst: e
      }), t;
    t.value = Array(o.length);
    const i = [];
    for (let s = 0; s < o.length; s++) {
      const u = o[s], c = n.element._zod.run({
        value: u,
        issues: []
      }, r);
      c instanceof Promise ? i.push(c.then((a) => le(a, t, s))) : le(c, t, s);
    }
    return i.length ? Promise.all(i).then(() => t) : t;
  };
});
function F(e, n, t, r, o) {
  if (e.issues.length) {
    if (o && !(t in r))
      return;
    n.issues.push(...je(t, e.issues));
  }
  e.value === void 0 ? t in r && (n.value[t] = void 0) : n.value[t] = e.value;
}
function Ue(e) {
  const n = Object.keys(e.shape);
  for (const r of n)
    if (!e.shape?.[r]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${r}": expected a Zod schema`);
  const t = pn(e.shape);
  return {
    ...e,
    keys: n,
    keySet: new Set(n),
    numKeys: n.length,
    optionalKeys: new Set(t)
  };
}
function De(e, n, t, r, o, i) {
  const s = [], u = o.keySet, c = o.catchall._zod, a = c.def.type, l = c.optout === "optional";
  for (const h in n) {
    if (u.has(h))
      continue;
    if (a === "never") {
      s.push(h);
      continue;
    }
    const d = c.run({ value: n[h], issues: [] }, r);
    d instanceof Promise ? e.push(d.then((p) => F(p, t, h, n, l))) : F(d, t, h, n, l);
  }
  return s.length && t.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: n,
    inst: i
  }), e.length ? Promise.all(e).then(() => t) : t;
}
const Kn = /* @__PURE__ */ f("$ZodObject", (e, n) => {
  if (v.init(e, n), !Object.getOwnPropertyDescriptor(n, "shape")?.get) {
    const u = n.shape;
    Object.defineProperty(n, "shape", {
      get: () => {
        const c = { ...u };
        return Object.defineProperty(n, "shape", {
          value: c
        }), c;
      }
    });
  }
  const r = te(() => Ue(n));
  m(e._zod, "propValues", () => {
    const u = n.shape, c = {};
    for (const a in u) {
      const l = u[a]._zod;
      if (l.values) {
        c[a] ?? (c[a] = /* @__PURE__ */ new Set());
        for (const h of l.values)
          c[a].add(h);
      }
    }
    return c;
  });
  const o = D, i = n.catchall;
  let s;
  e._zod.parse = (u, c) => {
    s ?? (s = r.value);
    const a = u.value;
    if (!o(a))
      return u.issues.push({
        expected: "object",
        code: "invalid_type",
        input: a,
        inst: e
      }), u;
    u.value = {};
    const l = [], h = s.shape;
    for (const d of s.keys) {
      const p = h[d], b = p._zod.optout === "optional", g = p._zod.run({ value: a[d], issues: [] }, c);
      g instanceof Promise ? l.push(g.then((T) => F(T, u, d, a, b))) : F(g, u, d, a, b);
    }
    return i ? De(l, a, u, c, r.value, e) : l.length ? Promise.all(l).then(() => u) : u;
  };
}), Yn = /* @__PURE__ */ f("$ZodObjectJIT", (e, n) => {
  Kn.init(e, n);
  const t = e._zod.parse, r = te(() => Ue(n)), o = (d) => {
    const p = new Dn(["shape", "payload", "ctx"]), b = r.value, g = (P) => {
      const w = ae(P);
      return `shape[${w}]._zod.run({ value: input[${w}], issues: [] }, ctx)`;
    };
    p.write("const input = payload.value;");
    const T = /* @__PURE__ */ Object.create(null);
    let q = 0;
    for (const P of b.keys)
      T[P] = `key_${q++}`;
    p.write("const newResult = {};");
    for (const P of b.keys) {
      const w = T[P], k = ae(P), nn = d[P]?._zod?.optout === "optional";
      p.write(`const ${w} = ${g(P)};`), nn ? p.write(`
        if (${w}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${w}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${w}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${w}.value;
        }
        
      `) : p.write(`
        if (${w}.issues.length) {
          payload.issues = payload.issues.concat(${w}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${w}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${w}.value;
        }
        
      `);
    }
    p.write("payload.value = newResult;"), p.write("return payload;");
    const K = p.compile();
    return (P, w) => K(d, P, w);
  };
  let i;
  const s = D, u = !Te.jitless, a = u && ln.value, l = n.catchall;
  let h;
  e._zod.parse = (d, p) => {
    h ?? (h = r.value);
    const b = d.value;
    return s(b) ? u && a && p?.async === !1 && p.jitless !== !0 ? (i || (i = o(n.shape)), d = i(d, p), l ? De([], b, d, p, h, e) : d) : t(d, p) : (d.issues.push({
      expected: "object",
      code: "invalid_type",
      input: b,
      inst: e
    }), d);
  };
});
function fe(e, n, t, r) {
  for (const i of e)
    if (i.issues.length === 0)
      return n.value = i.value, n;
  const o = e.filter((i) => !A(i));
  return o.length === 1 ? (n.value = o[0].value, o[0]) : (n.issues.push({
    code: "invalid_union",
    input: n.value,
    inst: t,
    errors: e.map((i) => i.issues.map((s) => j(s, r, Z())))
  }), n);
}
const Wn = /* @__PURE__ */ f("$ZodUnion", (e, n) => {
  v.init(e, n), m(e._zod, "optin", () => n.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0), m(e._zod, "optout", () => n.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), m(e._zod, "values", () => {
    if (n.options.every((o) => o._zod.values))
      return new Set(n.options.flatMap((o) => Array.from(o._zod.values)));
  }), m(e._zod, "pattern", () => {
    if (n.options.every((o) => o._zod.pattern)) {
      const o = n.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${o.map((i) => oe(i.source)).join("|")})$`);
    }
  });
  const t = n.options.length === 1, r = n.options[0]._zod.run;
  e._zod.parse = (o, i) => {
    if (t)
      return r(o, i);
    let s = !1;
    const u = [];
    for (const c of n.options) {
      const a = c._zod.run({
        value: o.value,
        issues: []
      }, i);
      if (a instanceof Promise)
        u.push(a), s = !0;
      else {
        if (a.issues.length === 0)
          return a;
        u.push(a);
      }
    }
    return s ? Promise.all(u).then((c) => fe(c, o, e, i)) : fe(u, o, e, i);
  };
}), Xn = /* @__PURE__ */ f("$ZodIntersection", (e, n) => {
  v.init(e, n), e._zod.parse = (t, r) => {
    const o = t.value, i = n.left._zod.run({ value: o, issues: [] }, r), s = n.right._zod.run({ value: o, issues: [] }, r);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([c, a]) => de(t, c, a)) : de(t, i, s);
  };
});
function Q(e, n) {
  if (e === n)
    return { valid: !0, data: e };
  if (e instanceof Date && n instanceof Date && +e == +n)
    return { valid: !0, data: e };
  if (M(e) && M(n)) {
    const t = Object.keys(n), r = Object.keys(e).filter((i) => t.indexOf(i) !== -1), o = { ...e, ...n };
    for (const i of r) {
      const s = Q(e[i], n[i]);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [i, ...s.mergeErrorPath]
        };
      o[i] = s.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(n)) {
    if (e.length !== n.length)
      return { valid: !1, mergeErrorPath: [] };
    const t = [];
    for (let r = 0; r < e.length; r++) {
      const o = e[r], i = n[r], s = Q(o, i);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...s.mergeErrorPath]
        };
      t.push(s.data);
    }
    return { valid: !0, data: t };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function de(e, n, t) {
  const r = /* @__PURE__ */ new Map();
  let o;
  for (const u of n.issues)
    if (u.code === "unrecognized_keys") {
      o ?? (o = u);
      for (const c of u.keys)
        r.has(c) || r.set(c, {}), r.get(c).l = !0;
    } else
      e.issues.push(u);
  for (const u of t.issues)
    if (u.code === "unrecognized_keys")
      for (const c of u.keys)
        r.has(c) || r.set(c, {}), r.get(c).r = !0;
    else
      e.issues.push(u);
  const i = [...r].filter(([, u]) => u.l && u.r).map(([u]) => u);
  if (i.length && o && e.issues.push({ ...o, keys: i }), A(e))
    return e;
  const s = Q(n.value, t.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const Qn = /* @__PURE__ */ f("$ZodEnum", (e, n) => {
  v.init(e, n);
  const t = Ee(n.entries), r = new Set(t);
  e._zod.values = r, e._zod.pattern = new RegExp(`^(${t.filter((o) => fn.has(typeof o)).map((o) => typeof o == "string" ? dn(o) : o.toString()).join("|")})$`), e._zod.parse = (o, i) => {
    const s = o.value;
    return r.has(s) || o.issues.push({
      code: "invalid_value",
      values: t,
      input: s,
      inst: e
    }), o;
  };
}), Hn = /* @__PURE__ */ f("$ZodTransform", (e, n) => {
  v.init(e, n), e._zod.parse = (t, r) => {
    if (r.direction === "backward")
      throw new $e(e.constructor.name);
    const o = n.transform(t.value, t);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((s) => (t.value = s, t));
    if (o instanceof Promise)
      throw new R();
    return t.value = o, t;
  };
});
function pe(e, n) {
  return e.issues.length && n === void 0 ? { issues: [], value: void 0 } : e;
}
const Fe = /* @__PURE__ */ f("$ZodOptional", (e, n) => {
  v.init(e, n), e._zod.optin = "optional", e._zod.optout = "optional", m(e._zod, "values", () => n.innerType._zod.values ? /* @__PURE__ */ new Set([...n.innerType._zod.values, void 0]) : void 0), m(e._zod, "pattern", () => {
    const t = n.innerType._zod.pattern;
    return t ? new RegExp(`^(${oe(t.source)})?$`) : void 0;
  }), e._zod.parse = (t, r) => {
    if (n.innerType._zod.optin === "optional") {
      const o = n.innerType._zod.run(t, r);
      return o instanceof Promise ? o.then((i) => pe(i, t.value)) : pe(o, t.value);
    }
    return t.value === void 0 ? t : n.innerType._zod.run(t, r);
  };
}), et = /* @__PURE__ */ f("$ZodExactOptional", (e, n) => {
  Fe.init(e, n), m(e._zod, "values", () => n.innerType._zod.values), m(e._zod, "pattern", () => n.innerType._zod.pattern), e._zod.parse = (t, r) => n.innerType._zod.run(t, r);
}), nt = /* @__PURE__ */ f("$ZodNullable", (e, n) => {
  v.init(e, n), m(e._zod, "optin", () => n.innerType._zod.optin), m(e._zod, "optout", () => n.innerType._zod.optout), m(e._zod, "pattern", () => {
    const t = n.innerType._zod.pattern;
    return t ? new RegExp(`^(${oe(t.source)}|null)$`) : void 0;
  }), m(e._zod, "values", () => n.innerType._zod.values ? /* @__PURE__ */ new Set([...n.innerType._zod.values, null]) : void 0), e._zod.parse = (t, r) => t.value === null ? t : n.innerType._zod.run(t, r);
}), tt = /* @__PURE__ */ f("$ZodDefault", (e, n) => {
  v.init(e, n), e._zod.optin = "optional", m(e._zod, "values", () => n.innerType._zod.values), e._zod.parse = (t, r) => {
    if (r.direction === "backward")
      return n.innerType._zod.run(t, r);
    if (t.value === void 0)
      return t.value = n.defaultValue, t;
    const o = n.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((i) => he(i, n)) : he(o, n);
  };
});
function he(e, n) {
  return e.value === void 0 && (e.value = n.defaultValue), e;
}
const rt = /* @__PURE__ */ f("$ZodPrefault", (e, n) => {
  v.init(e, n), e._zod.optin = "optional", m(e._zod, "values", () => n.innerType._zod.values), e._zod.parse = (t, r) => (r.direction === "backward" || t.value === void 0 && (t.value = n.defaultValue), n.innerType._zod.run(t, r));
}), ot = /* @__PURE__ */ f("$ZodNonOptional", (e, n) => {
  v.init(e, n), m(e._zod, "values", () => {
    const t = n.innerType._zod.values;
    return t ? new Set([...t].filter((r) => r !== void 0)) : void 0;
  }), e._zod.parse = (t, r) => {
    const o = n.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((i) => me(i, e)) : me(o, e);
  };
});
function me(e, n) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: n
  }), e;
}
const st = /* @__PURE__ */ f("$ZodCatch", (e, n) => {
  v.init(e, n), m(e._zod, "optin", () => n.innerType._zod.optin), m(e._zod, "optout", () => n.innerType._zod.optout), m(e._zod, "values", () => n.innerType._zod.values), e._zod.parse = (t, r) => {
    if (r.direction === "backward")
      return n.innerType._zod.run(t, r);
    const o = n.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((i) => (t.value = i.value, i.issues.length && (t.value = n.catchValue({
      ...t,
      error: {
        issues: i.issues.map((s) => j(s, r, Z()))
      },
      input: t.value
    }), t.issues = []), t)) : (t.value = o.value, o.issues.length && (t.value = n.catchValue({
      ...t,
      error: {
        issues: o.issues.map((i) => j(i, r, Z()))
      },
      input: t.value
    }), t.issues = []), t);
  };
}), it = /* @__PURE__ */ f("$ZodPipe", (e, n) => {
  v.init(e, n), m(e._zod, "values", () => n.in._zod.values), m(e._zod, "optin", () => n.in._zod.optin), m(e._zod, "optout", () => n.out._zod.optout), m(e._zod, "propValues", () => n.in._zod.propValues), e._zod.parse = (t, r) => {
    if (r.direction === "backward") {
      const i = n.out._zod.run(t, r);
      return i instanceof Promise ? i.then((s) => U(s, n.in, r)) : U(i, n.in, r);
    }
    const o = n.in._zod.run(t, r);
    return o instanceof Promise ? o.then((i) => U(i, n.out, r)) : U(o, n.out, r);
  };
});
function U(e, n, t) {
  return e.issues.length ? (e.aborted = !0, e) : n._zod.run({ value: e.value, issues: e.issues }, t);
}
const ut = /* @__PURE__ */ f("$ZodReadonly", (e, n) => {
  v.init(e, n), m(e._zod, "propValues", () => n.innerType._zod.propValues), m(e._zod, "values", () => n.innerType._zod.values), m(e._zod, "optin", () => n.innerType?._zod?.optin), m(e._zod, "optout", () => n.innerType?._zod?.optout), e._zod.parse = (t, r) => {
    if (r.direction === "backward")
      return n.innerType._zod.run(t, r);
    const o = n.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then(ge) : ge(o);
  };
});
function ge(e) {
  return e.value = Object.freeze(e.value), e;
}
const ct = /* @__PURE__ */ f("$ZodCustom", (e, n) => {
  $.init(e, n), v.init(e, n), e._zod.parse = (t, r) => t, e._zod.check = (t) => {
    const r = t.value, o = n.fn(r);
    if (o instanceof Promise)
      return o.then((i) => _e(i, t, r, e));
    _e(o, t, r, e);
  };
});
function _e(e, n, t, r) {
  if (!e) {
    const o = {
      code: "custom",
      input: t,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (o.params = r._zod.def.params), n.issues.push(J(o));
  }
}
var ve;
class at {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(n, ...t) {
    const r = t[0];
    return this._map.set(n, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, n), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(n) {
    const t = this._map.get(n);
    return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(n), this;
  }
  get(n) {
    const t = n._zod.parent;
    if (t) {
      const r = { ...this.get(t) ?? {} };
      delete r.id;
      const o = { ...r, ...this._map.get(n) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(n);
  }
  has(n) {
    return this._map.has(n);
  }
}
function lt() {
  return new at();
}
(ve = globalThis).__zod_globalRegistry ?? (ve.__zod_globalRegistry = lt());
const C = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function ft(e, n) {
  return new e({
    type: "number",
    checks: [],
    ..._(n)
  });
}
// @__NO_SIDE_EFFECTS__
function dt(e, n) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ..._(n)
  });
}
// @__NO_SIDE_EFFECTS__
function pt(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function ht(e, n) {
  return new e({
    type: "never",
    ..._(n)
  });
}
// @__NO_SIDE_EFFECTS__
function ye(e, n) {
  return new Me({
    check: "less_than",
    ..._(n),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Y(e, n) {
  return new Me({
    check: "less_than",
    ..._(n),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function be(e, n) {
  return new Je({
    check: "greater_than",
    ..._(n),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function W(e, n) {
  return new Je({
    check: "greater_than",
    ..._(n),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function we(e, n) {
  return new Rn({
    check: "multiple_of",
    ..._(n),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function mt(e, n) {
  return new Mn({
    check: "max_length",
    ..._(n),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function ze(e, n) {
  return new Jn({
    check: "min_length",
    ..._(n),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function gt(e, n) {
  return new Gn({
    check: "length_equals",
    ..._(n),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function _t(e) {
  return new Un({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function vt(e, n, t) {
  return new e({
    type: "array",
    element: n,
    // get element() {
    //   return element;
    // },
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function yt(e, n, t) {
  return new e({
    type: "custom",
    check: "custom",
    fn: n,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function bt(e) {
  const n = /* @__PURE__ */ wt((t) => (t.addIssue = (r) => {
    if (typeof r == "string")
      t.issues.push(J(r, t.value, n._zod.def));
    else {
      const o = r;
      o.fatal && (o.continue = !1), o.code ?? (o.code = "custom"), o.input ?? (o.input = t.value), o.inst ?? (o.inst = n), o.continue ?? (o.continue = !n._zod.def.abort), t.issues.push(J(o));
    }
  }, e(t.value, t)));
  return n;
}
// @__NO_SIDE_EFFECTS__
function wt(e, n) {
  const t = new $({
    check: "custom",
    ..._(n)
  });
  return t._zod.check = e, t;
}
function Ve(e) {
  let n = e?.target ?? "draft-2020-12";
  return n === "draft-4" && (n = "draft-04"), n === "draft-7" && (n = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: e?.metadata ?? C,
    target: n,
    unrepresentable: e?.unrepresentable ?? "throw",
    override: e?.override ?? (() => {
    }),
    io: e?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: e?.cycles ?? "ref",
    reused: e?.reused ?? "inline",
    external: e?.external ?? void 0
  };
}
function z(e, n, t = { path: [], schemaPath: [] }) {
  var r;
  const o = e._zod.def, i = n.seen.get(e);
  if (i)
    return i.count++, t.schemaPath.includes(e) && (i.cycle = t.path), i.schema;
  const s = { schema: {}, count: 1, cycle: void 0, path: t.path };
  n.seen.set(e, s);
  const u = e._zod.toJSONSchema?.();
  if (u)
    s.schema = u;
  else {
    const l = {
      ...t,
      schemaPath: [...t.schemaPath, e],
      path: t.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(n, s.schema, l);
    else {
      const d = s.schema, p = n.processors[o.type];
      if (!p)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      p(e, n, d, l);
    }
    const h = e._zod.parent;
    h && (s.ref || (s.ref = h), z(h, n, l), n.seen.get(h).isParent = !0);
  }
  const c = n.metadataRegistry.get(e);
  return c && Object.assign(s.schema, c), n.io === "input" && O(e) && (delete s.schema.examples, delete s.schema.default), n.io === "input" && s.schema._prefault && ((r = s.schema).default ?? (r.default = s.schema._prefault)), delete s.schema._prefault, n.seen.get(e).schema;
}
function Be(e, n) {
  const t = e.seen.get(n);
  if (!t)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = /* @__PURE__ */ new Map();
  for (const s of e.seen.entries()) {
    const u = e.metadataRegistry.get(s[0])?.id;
    if (u) {
      const c = r.get(u);
      if (c && c !== s[0])
        throw new Error(`Duplicate schema id "${u}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(u, s[0]);
    }
  }
  const o = (s) => {
    const u = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const h = e.external.registry.get(s[0])?.id, d = e.external.uri ?? ((b) => b);
      if (h)
        return { ref: d(h) };
      const p = s[1].defId ?? s[1].schema.id ?? `schema${e.counter++}`;
      return s[1].defId = p, { defId: p, ref: `${d("__shared")}#/${u}/${p}` };
    }
    if (s[1] === t)
      return { ref: "#" };
    const a = `#/${u}/`, l = s[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: l, ref: a + l };
  }, i = (s) => {
    if (s[1].schema.$ref)
      return;
    const u = s[1], { ref: c, defId: a } = o(s);
    u.def = { ...u.schema }, a && (u.defId = a);
    const l = u.schema;
    for (const h in l)
      delete l[h];
    l.$ref = c;
  };
  if (e.cycles === "throw")
    for (const s of e.seen.entries()) {
      const u = s[1];
      if (u.cycle)
        throw new Error(`Cycle detected: #/${u.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const s of e.seen.entries()) {
    const u = s[1];
    if (n === s[0]) {
      i(s);
      continue;
    }
    if (e.external) {
      const a = e.external.registry.get(s[0])?.id;
      if (n !== s[0] && a) {
        i(s);
        continue;
      }
    }
    if (e.metadataRegistry.get(s[0])?.id) {
      i(s);
      continue;
    }
    if (u.cycle) {
      i(s);
      continue;
    }
    if (u.count > 1 && e.reused === "ref") {
      i(s);
      continue;
    }
  }
}
function Le(e, n) {
  const t = e.seen.get(n);
  if (!t)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (s) => {
    const u = e.seen.get(s);
    if (u.ref === null)
      return;
    const c = u.def ?? u.schema, a = { ...c }, l = u.ref;
    if (u.ref = null, l) {
      r(l);
      const d = e.seen.get(l), p = d.schema;
      if (p.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (c.allOf = c.allOf ?? [], c.allOf.push(p)) : Object.assign(c, p), Object.assign(c, a), s._zod.parent === l)
        for (const g in c)
          g === "$ref" || g === "allOf" || g in a || delete c[g];
      if (p.$ref && d.def)
        for (const g in c)
          g === "$ref" || g === "allOf" || g in d.def && JSON.stringify(c[g]) === JSON.stringify(d.def[g]) && delete c[g];
    }
    const h = s._zod.parent;
    if (h && h !== l) {
      r(h);
      const d = e.seen.get(h);
      if (d?.schema.$ref && (c.$ref = d.schema.$ref, d.def))
        for (const p in c)
          p === "$ref" || p === "allOf" || p in d.def && JSON.stringify(c[p]) === JSON.stringify(d.def[p]) && delete c[p];
    }
    e.override({
      zodSchema: s,
      jsonSchema: c,
      path: u.path ?? []
    });
  };
  for (const s of [...e.seen.entries()].reverse())
    r(s[0]);
  const o = {};
  if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
    const s = e.external.registry.get(n)?.id;
    if (!s)
      throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(s);
  }
  Object.assign(o, t.def ?? t.schema);
  const i = e.external?.defs ?? {};
  for (const s of e.seen.entries()) {
    const u = s[1];
    u.def && u.defId && (i[u.defId] = u.def);
  }
  e.external || Object.keys(i).length > 0 && (e.target === "draft-2020-12" ? o.$defs = i : o.definitions = i);
  try {
    const s = JSON.parse(JSON.stringify(o));
    return Object.defineProperty(s, "~standard", {
      value: {
        ...n["~standard"],
        jsonSchema: {
          input: V(n, "input", e.processors),
          output: V(n, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), s;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function O(e, n) {
  const t = n ?? { seen: /* @__PURE__ */ new Set() };
  if (t.seen.has(e))
    return !1;
  t.seen.add(e);
  const r = e._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return O(r.element, t);
  if (r.type === "set")
    return O(r.valueType, t);
  if (r.type === "lazy")
    return O(r.getter(), t);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault")
    return O(r.innerType, t);
  if (r.type === "intersection")
    return O(r.left, t) || O(r.right, t);
  if (r.type === "record" || r.type === "map")
    return O(r.keyType, t) || O(r.valueType, t);
  if (r.type === "pipe")
    return O(r.in, t) || O(r.out, t);
  if (r.type === "object") {
    for (const o in r.shape)
      if (O(r.shape[o], t))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const o of r.options)
      if (O(o, t))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const o of r.items)
      if (O(o, t))
        return !0;
    return !!(r.rest && O(r.rest, t));
  }
  return !1;
}
const zt = (e, n = {}) => (t) => {
  const r = Ve({ ...t, processors: n });
  return z(e, r), Be(r, e), Le(r, e);
}, V = (e, n, t = {}) => (r) => {
  const { libraryOptions: o, target: i } = r ?? {}, s = Ve({ ...o ?? {}, target: i, io: n, processors: t });
  return z(e, s), Be(s, e), Le(s, e);
}, kt = (e, n, t, r) => {
  const o = t, { minimum: i, maximum: s, format: u, multipleOf: c, exclusiveMaximum: a, exclusiveMinimum: l } = e._zod.bag;
  typeof u == "string" && u.includes("int") ? o.type = "integer" : o.type = "number", typeof l == "number" && (n.target === "draft-04" || n.target === "openapi-3.0" ? (o.minimum = l, o.exclusiveMinimum = !0) : o.exclusiveMinimum = l), typeof i == "number" && (o.minimum = i, typeof l == "number" && n.target !== "draft-04" && (l >= i ? delete o.minimum : delete o.exclusiveMinimum)), typeof a == "number" && (n.target === "draft-04" || n.target === "openapi-3.0" ? (o.maximum = a, o.exclusiveMaximum = !0) : o.exclusiveMaximum = a), typeof s == "number" && (o.maximum = s, typeof a == "number" && n.target !== "draft-04" && (a <= s ? delete o.maximum : delete o.exclusiveMaximum)), typeof c == "number" && (o.multipleOf = c);
}, Ot = (e, n, t, r) => {
  t.not = {};
}, Pt = (e, n, t, r) => {
}, xt = (e, n, t, r) => {
  const o = e._zod.def, i = Ee(o.entries);
  i.every((s) => typeof s == "number") && (t.type = "number"), i.every((s) => typeof s == "string") && (t.type = "string"), t.enum = i;
}, St = (e, n, t, r) => {
  if (n.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, $t = (e, n, t, r) => {
  if (n.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, Tt = (e, n, t, r) => {
  const o = t, i = e._zod.def, { minimum: s, maximum: u } = e._zod.bag;
  typeof s == "number" && (o.minItems = s), typeof u == "number" && (o.maxItems = u), o.type = "array", o.items = z(i.element, n, { ...r, path: [...r.path, "items"] });
}, Et = (e, n, t, r) => {
  const o = t, i = e._zod.def;
  o.type = "object", o.properties = {};
  const s = i.shape;
  for (const a in s)
    o.properties[a] = z(s[a], n, {
      ...r,
      path: [...r.path, "properties", a]
    });
  const u = new Set(Object.keys(s)), c = new Set([...u].filter((a) => {
    const l = i.shape[a]._zod;
    return n.io === "input" ? l.optin === void 0 : l.optout === void 0;
  }));
  c.size > 0 && (o.required = Array.from(c)), i.catchall?._zod.def.type === "never" ? o.additionalProperties = !1 : i.catchall ? i.catchall && (o.additionalProperties = z(i.catchall, n, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : n.io === "output" && (o.additionalProperties = !1);
}, Nt = (e, n, t, r) => {
  const o = e._zod.def, i = o.inclusive === !1, s = o.options.map((u, c) => z(u, n, {
    ...r,
    path: [...r.path, i ? "oneOf" : "anyOf", c]
  }));
  i ? t.oneOf = s : t.anyOf = s;
}, Zt = (e, n, t, r) => {
  const o = e._zod.def, i = z(o.left, n, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), s = z(o.right, n, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), u = (a) => "allOf" in a && Object.keys(a).length === 1, c = [
    ...u(i) ? i.allOf : [i],
    ...u(s) ? s.allOf : [s]
  ];
  t.allOf = c;
}, jt = (e, n, t, r) => {
  const o = e._zod.def, i = z(o.innerType, n, r), s = n.seen.get(e);
  n.target === "openapi-3.0" ? (s.ref = o.innerType, t.nullable = !0) : t.anyOf = [i, { type: "null" }];
}, It = (e, n, t, r) => {
  const o = e._zod.def;
  z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType;
}, At = (e, n, t, r) => {
  const o = e._zod.def;
  z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType, t.default = JSON.parse(JSON.stringify(o.defaultValue));
}, Rt = (e, n, t, r) => {
  const o = e._zod.def;
  z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType, n.io === "input" && (t._prefault = JSON.parse(JSON.stringify(o.defaultValue)));
}, Ct = (e, n, t, r) => {
  const o = e._zod.def;
  z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType;
  let s;
  try {
    s = o.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  t.default = s;
}, Mt = (e, n, t, r) => {
  const o = e._zod.def, i = n.io === "input" ? o.in._zod.def.type === "transform" ? o.out : o.in : o.out;
  z(i, n, r);
  const s = n.seen.get(e);
  s.ref = i;
}, Jt = (e, n, t, r) => {
  const o = e._zod.def;
  z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType, t.readOnly = !0;
}, qe = (e, n, t, r) => {
  const o = e._zod.def;
  z(o.innerType, n, r);
  const i = n.seen.get(e);
  i.ref = o.innerType;
}, Gt = (e, n) => {
  Ae.init(e, n), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (t) => kn(e, t)
      // enumerable: false,
    },
    flatten: {
      value: (t) => zn(e, t)
      // enumerable: false,
    },
    addIssue: {
      value: (t) => {
        e.issues.push(t), e.message = JSON.stringify(e.issues, X, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (t) => {
        e.issues.push(...t), e.message = JSON.stringify(e.issues, X, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return e.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, x = f("ZodError", Gt, {
  Parent: Error
}), Ut = /* @__PURE__ */ ie(x), Dt = /* @__PURE__ */ ue(x), Ft = /* @__PURE__ */ B(x), Vt = /* @__PURE__ */ L(x), Bt = /* @__PURE__ */ xn(x), Lt = /* @__PURE__ */ Sn(x), qt = /* @__PURE__ */ $n(x), Kt = /* @__PURE__ */ Tn(x), Yt = /* @__PURE__ */ En(x), Wt = /* @__PURE__ */ Nn(x), Xt = /* @__PURE__ */ Zn(x), Qt = /* @__PURE__ */ jn(x), y = /* @__PURE__ */ f("ZodType", (e, n) => (v.init(e, n), Object.assign(e["~standard"], {
  jsonSchema: {
    input: V(e, "input"),
    output: V(e, "output")
  }
}), e.toJSONSchema = zt(e, {}), e.def = n, e.type = n.type, Object.defineProperty(e, "_def", { value: n }), e.check = (...t) => e.clone(E(n, {
  checks: [
    ...n.checks ?? [],
    ...t.map((r) => typeof r == "function" ? { _zod: { check: r, def: { check: "custom" }, onattach: [] } } : r)
  ]
}), {
  parent: !0
}), e.with = e.check, e.clone = (t, r) => N(e, t, r), e.brand = () => e, e.register = ((t, r) => (t.add(e, r), e)), e.parse = (t, r) => Ut(e, t, r, { callee: e.parse }), e.safeParse = (t, r) => Ft(e, t, r), e.parseAsync = async (t, r) => Dt(e, t, r, { callee: e.parseAsync }), e.safeParseAsync = async (t, r) => Vt(e, t, r), e.spa = e.safeParseAsync, e.encode = (t, r) => Bt(e, t, r), e.decode = (t, r) => Lt(e, t, r), e.encodeAsync = async (t, r) => qt(e, t, r), e.decodeAsync = async (t, r) => Kt(e, t, r), e.safeEncode = (t, r) => Yt(e, t, r), e.safeDecode = (t, r) => Wt(e, t, r), e.safeEncodeAsync = async (t, r) => Xt(e, t, r), e.safeDecodeAsync = async (t, r) => Qt(e, t, r), e.refine = (t, r) => e.check(xr(t, r)), e.superRefine = (t) => e.check(Sr(t)), e.overwrite = (t) => e.check(/* @__PURE__ */ _t(t)), e.optional = () => Pe(e), e.exactOptional = () => pr(e), e.nullable = () => xe(e), e.nullish = () => Pe(xe(e)), e.nonoptional = (t) => yr(e, t), e.array = () => or(e), e.or = (t) => ur([e, t]), e.and = (t) => ar(e, t), e.transform = (t) => Se(e, fr(t)), e.default = (t) => gr(e, t), e.prefault = (t) => vr(e, t), e.catch = (t) => wr(e, t), e.pipe = (t) => Se(e, t), e.readonly = () => Or(e), e.describe = (t) => {
  const r = e.clone();
  return C.add(r, { description: t }), r;
}, Object.defineProperty(e, "description", {
  get() {
    return C.get(e)?.description;
  },
  configurable: !0
}), e.meta = (...t) => {
  if (t.length === 0)
    return C.get(e);
  const r = e.clone();
  return C.add(r, t[0]), r;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e.apply = (t) => t(e), e)), Ke = /* @__PURE__ */ f("ZodNumber", (e, n) => {
  Ge.init(e, n), y.init(e, n), e._zod.processJSONSchema = (r, o, i) => kt(e, r, o), e.gt = (r, o) => e.check(/* @__PURE__ */ be(r, o)), e.gte = (r, o) => e.check(/* @__PURE__ */ W(r, o)), e.min = (r, o) => e.check(/* @__PURE__ */ W(r, o)), e.lt = (r, o) => e.check(/* @__PURE__ */ ye(r, o)), e.lte = (r, o) => e.check(/* @__PURE__ */ Y(r, o)), e.max = (r, o) => e.check(/* @__PURE__ */ Y(r, o)), e.int = (r) => e.check(ke(r)), e.safe = (r) => e.check(ke(r)), e.positive = (r) => e.check(/* @__PURE__ */ be(0, r)), e.nonnegative = (r) => e.check(/* @__PURE__ */ W(0, r)), e.negative = (r) => e.check(/* @__PURE__ */ ye(0, r)), e.nonpositive = (r) => e.check(/* @__PURE__ */ Y(0, r)), e.multipleOf = (r, o) => e.check(/* @__PURE__ */ we(r, o)), e.step = (r, o) => e.check(/* @__PURE__ */ we(r, o)), e.finite = () => e;
  const t = e._zod.bag;
  e.minValue = Math.max(t.minimum ?? Number.NEGATIVE_INFINITY, t.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(t.maximum ?? Number.POSITIVE_INFINITY, t.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (t.format ?? "").includes("int") || Number.isSafeInteger(t.multipleOf ?? 0.5), e.isFinite = !0, e.format = t.format ?? null;
});
function S(e) {
  return /* @__PURE__ */ ft(Ke, e);
}
const Ht = /* @__PURE__ */ f("ZodNumberFormat", (e, n) => {
  Vn.init(e, n), Ke.init(e, n);
});
function ke(e) {
  return /* @__PURE__ */ dt(Ht, e);
}
const er = /* @__PURE__ */ f("ZodUnknown", (e, n) => {
  Bn.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => Pt();
});
function Oe() {
  return /* @__PURE__ */ pt(er);
}
const nr = /* @__PURE__ */ f("ZodNever", (e, n) => {
  Ln.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => Ot(e, t, r);
});
function tr(e) {
  return /* @__PURE__ */ ht(nr, e);
}
const rr = /* @__PURE__ */ f("ZodArray", (e, n) => {
  qn.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => Tt(e, t, r, o), e.element = n.element, e.min = (t, r) => e.check(/* @__PURE__ */ ze(t, r)), e.nonempty = (t) => e.check(/* @__PURE__ */ ze(1, t)), e.max = (t, r) => e.check(/* @__PURE__ */ mt(t, r)), e.length = (t, r) => e.check(/* @__PURE__ */ gt(t, r)), e.unwrap = () => e.element;
});
function or(e, n) {
  return /* @__PURE__ */ vt(rr, e, n);
}
const sr = /* @__PURE__ */ f("ZodObject", (e, n) => {
  Yn.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => Et(e, t, r, o), m(e, "shape", () => n.shape), e.keyof = () => We(Object.keys(e._zod.def.shape)), e.catchall = (t) => e.clone({ ...e._zod.def, catchall: t }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: Oe() }), e.loose = () => e.clone({ ...e._zod.def, catchall: Oe() }), e.strict = () => e.clone({ ...e._zod.def, catchall: tr() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (t) => _n(e, t), e.safeExtend = (t) => vn(e, t), e.merge = (t) => yn(e, t), e.pick = (t) => mn(e, t), e.omit = (t) => gn(e, t), e.partial = (...t) => bn(Xe, e, t[0]), e.required = (...t) => wn(Qe, e, t[0]);
});
function Ye(e, n) {
  const t = {
    type: "object",
    shape: e ?? {},
    ..._(n)
  };
  return new sr(t);
}
const ir = /* @__PURE__ */ f("ZodUnion", (e, n) => {
  Wn.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => Nt(e, t, r, o), e.options = n.options;
});
function ur(e, n) {
  return new ir({
    type: "union",
    options: e,
    ..._(n)
  });
}
const cr = /* @__PURE__ */ f("ZodIntersection", (e, n) => {
  Xn.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => Zt(e, t, r, o);
});
function ar(e, n) {
  return new cr({
    type: "intersection",
    left: e,
    right: n
  });
}
const H = /* @__PURE__ */ f("ZodEnum", (e, n) => {
  Qn.init(e, n), y.init(e, n), e._zod.processJSONSchema = (r, o, i) => xt(e, r, o), e.enum = n.entries, e.options = Object.values(n.entries);
  const t = new Set(Object.keys(n.entries));
  e.extract = (r, o) => {
    const i = {};
    for (const s of r)
      if (t.has(s))
        i[s] = n.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new H({
      ...n,
      checks: [],
      ..._(o),
      entries: i
    });
  }, e.exclude = (r, o) => {
    const i = { ...n.entries };
    for (const s of r)
      if (t.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new H({
      ...n,
      checks: [],
      ..._(o),
      entries: i
    });
  };
});
function We(e, n) {
  const t = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new H({
    type: "enum",
    entries: t,
    ..._(n)
  });
}
const lr = /* @__PURE__ */ f("ZodTransform", (e, n) => {
  Hn.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => $t(e, t), e._zod.parse = (t, r) => {
    if (r.direction === "backward")
      throw new $e(e.constructor.name);
    t.addIssue = (i) => {
      if (typeof i == "string")
        t.issues.push(J(i, t.value, n));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = t.value), s.inst ?? (s.inst = e), t.issues.push(J(s));
      }
    };
    const o = n.transform(t.value, t);
    return o instanceof Promise ? o.then((i) => (t.value = i, t)) : (t.value = o, t);
  };
});
function fr(e) {
  return new lr({
    type: "transform",
    transform: e
  });
}
const Xe = /* @__PURE__ */ f("ZodOptional", (e, n) => {
  Fe.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => qe(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Pe(e) {
  return new Xe({
    type: "optional",
    innerType: e
  });
}
const dr = /* @__PURE__ */ f("ZodExactOptional", (e, n) => {
  et.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => qe(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function pr(e) {
  return new dr({
    type: "optional",
    innerType: e
  });
}
const hr = /* @__PURE__ */ f("ZodNullable", (e, n) => {
  nt.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => jt(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function xe(e) {
  return new hr({
    type: "nullable",
    innerType: e
  });
}
const mr = /* @__PURE__ */ f("ZodDefault", (e, n) => {
  tt.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => At(e, t, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function gr(e, n) {
  return new mr({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof n == "function" ? n() : Ze(n);
    }
  });
}
const _r = /* @__PURE__ */ f("ZodPrefault", (e, n) => {
  rt.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => Rt(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function vr(e, n) {
  return new _r({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof n == "function" ? n() : Ze(n);
    }
  });
}
const Qe = /* @__PURE__ */ f("ZodNonOptional", (e, n) => {
  ot.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => It(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function yr(e, n) {
  return new Qe({
    type: "nonoptional",
    innerType: e,
    ..._(n)
  });
}
const br = /* @__PURE__ */ f("ZodCatch", (e, n) => {
  st.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => Ct(e, t, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function wr(e, n) {
  return new br({
    type: "catch",
    innerType: e,
    catchValue: typeof n == "function" ? n : () => n
  });
}
const zr = /* @__PURE__ */ f("ZodPipe", (e, n) => {
  it.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => Mt(e, t, r, o), e.in = n.in, e.out = n.out;
});
function Se(e, n) {
  return new zr({
    type: "pipe",
    in: e,
    out: n
    // ...util.normalizeParams(params),
  });
}
const kr = /* @__PURE__ */ f("ZodReadonly", (e, n) => {
  ut.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => Jt(e, t, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Or(e) {
  return new kr({
    type: "readonly",
    innerType: e
  });
}
const Pr = /* @__PURE__ */ f("ZodCustom", (e, n) => {
  ct.init(e, n), y.init(e, n), e._zod.processJSONSchema = (t, r, o) => St(e, t);
});
function xr(e, n = {}) {
  return /* @__PURE__ */ yt(Pr, e, n);
}
function Sr(e) {
  return /* @__PURE__ */ bt(e);
}
const $r = `struct LightingParams {
    params1: vec4<f32>,
    params2: vec4<f32>,
    params3: vec4<f32>,
    raw: vec4<f32>,
}

@group(0) @binding(0) var sourceTexture: texture_2d<u32>;
@group(0) @binding(1) var<uniform> lighting: LightingParams;

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    var positions = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>(-1.0,  1.0),
    vec2<f32>( 1.0, -1.0),
    vec2<f32>( 1.0,  1.0)
  );
    let pos = positions[vertexIndex];
    return vec4<f32>(pos, 0.0, 1.0);
}

fn clampCoord(c: vec2<i32>, dim: vec2<i32>) -> vec2<i32> {
    return vec2<i32>(clamp(c.x, 0, dim.x - 1), clamp(c.y, 0, dim.y - 1));
}

fn rawAt(c: vec2<i32>) -> f32 {
    let dimU = textureDimensions(sourceTexture);
    let dim = vec2<i32>(i32(dimU.x), i32(dimU.y));
    let cc = clampCoord(c, dim);
    let v = textureLoad(sourceTexture, cc, 0).r;
    return f32(v);
}

fn cfaColor(x: i32, y: i32, pattern: i32) -> i32 {
    let xx = x & 1;
    let yy = y & 1;

    if pattern == 0 {
        if yy == 0 && xx == 0 { return 0; }
        if yy == 0 && xx == 1 { return 1; }
        if yy == 1 && xx == 0 { return 1; }
        return 2;
    }
    if pattern == 1 {
        if yy == 0 && xx == 0 { return 2; }
        if yy == 0 && xx == 1 { return 1; }
        if yy == 1 && xx == 0 { return 1; }
        return 0;
    }
    if pattern == 2 {
        if yy == 0 && xx == 0 { return 1; }
        if yy == 0 && xx == 1 { return 0; }
        if yy == 1 && xx == 0 { return 2; }
        return 1;
    }
    if yy == 0 && xx == 0 { return 1; }
    if yy == 0 && xx == 1 { return 2; }
    if yy == 1 && xx == 0 { return 0; }
    return 1;
}

fn demosaicBilinear(x: i32, y: i32, pattern: i32) -> vec3<f32> {
    let here = rawAt(vec2<i32>(x, y));
    let color = cfaColor(x, y, pattern);

    if color == 0 {
        let g = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y)) + rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.25;
        let b = (rawAt(vec2<i32>(x - 1, y - 1)) + rawAt(vec2<i32>(x + 1, y - 1)) + rawAt(vec2<i32>(x - 1, y + 1)) + rawAt(vec2<i32>(x + 1, y + 1))) * 0.25;
        return vec3<f32>(here, g, b);
    }

    if color == 2 {
        let g = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y)) + rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.25;
        let r = (rawAt(vec2<i32>(x - 1, y - 1)) + rawAt(vec2<i32>(x + 1, y - 1)) + rawAt(vec2<i32>(x - 1, y + 1)) + rawAt(vec2<i32>(x + 1, y + 1))) * 0.25;
        return vec3<f32>(r, g, here);
    }

    var r: f32 = 0.0;
    var b: f32 = 0.0;
    let leftColor = cfaColor(x - 1, y, pattern);
    let rightColor = cfaColor(x + 1, y, pattern);
    if leftColor == 0 || rightColor == 0 {
        r = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y))) * 0.5;
        b = (rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.5;
    } else {
        r = (rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.5;
        b = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y))) * 0.5;
    }
    return vec3<f32>(r, here, b);
}

fn rgb2hsv(c: vec3<f32>) -> vec3<f32> {
    let K = vec4<f32>(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    let p = mix(vec4<f32>(c.bg, K.wz), vec4<f32>(c.gb, K.xy), step(c.b, c.g));
    let q = mix(vec4<f32>(p.xyw, c.r), vec4<f32>(c.r, p.yzx), step(p.x, c.r));
    let d = q.x - min(q.w, q.y);
    let e = 1.0e-10;
    return vec3<f32>(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

fn hsv2rgb(c: vec3<f32>) -> vec3<f32> {
    let K = vec4<f32>(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    let p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), c.y);
}

@fragment
fn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
    let dimU = textureDimensions(sourceTexture);
    let x = clamp(i32(pos.x), 0, i32(dimU.x) - 1);
    let y = clamp(i32(pos.y), 0, i32(dimU.y) - 1);

    let maxVal = lighting.raw.x;
    let pattern = i32(lighting.raw.y + 0.5);

    var rgb = demosaicBilinear(x, y, pattern) / maxVal;

    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));

    let exposure = lighting.params1.x;
    let contrast = lighting.params1.y;
    let saturation = lighting.params1.z;
    let vibrance = lighting.params1.w;
    let highlights = lighting.params2.x;
    let shadows = lighting.params2.y;
    let whites = lighting.params2.z;
    let blacks = lighting.params2.w;
    let tint = lighting.params3.x;
    let temperature = lighting.params3.y;
    let hueShift = lighting.params3.z;

    rgb = rgb * pow(2.0, exposure);

    let wbR = 1.0 + temperature * 0.5;
    let wbB = 1.0 - temperature * 0.5;
    let wbG = 1.0 + tint * 0.5;
    rgb = vec3<f32>(rgb.r * wbR, rgb.g * wbG, rgb.b * wbB);

    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));

    let mid = vec3<f32>(0.5);
    rgb = mix(mid, rgb, contrast);

    let luminance = dot(rgb, vec3<f32>(0.299, 0.587, 0.114));
    let shadowFactor = smoothstep(0.0, 0.5, 1.0 - luminance);
    let highlightFactor = smoothstep(0.5, 1.0, luminance);
    rgb = rgb + shadowFactor * (shadows - 1.0) * 0.2;
    rgb = rgb - highlightFactor * (highlights - 1.0) * 0.2;

    rgb = rgb + (whites - 1.0) * 0.1;
    rgb = rgb - (blacks - 1.0) * 0.1;

    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));

    var hsv = rgb2hsv(rgb);
    hsv.x = fract(hsv.x + hueShift);
    hsv.y = hsv.y * saturation;
    hsv.y = clamp(hsv.y, 0.0, 1.0);

    let vibBoost = vibrance * (1.0 - hsv.y) * 0.5;
    hsv.y = clamp(hsv.y + vibBoost, 0.0, 1.0);

    rgb = hsv2rgb(hsv);

    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));
    rgb = pow(rgb, vec3<f32>(1.0 / 2.2));

    return vec4<f32>(rgb, 1.0);
}
`, He = Ye({
  exposure: S().default(0),
  contrast: S().default(1),
  saturation: S().default(1),
  vibrance: S().default(0),
  highlights: S().default(1),
  shadows: S().default(1),
  whites: S().default(1),
  blacks: S().default(1),
  tint: S().default(0),
  temperature: S().default(0),
  hue: S().default(0)
}), en = We(["RGGB", "BGGR", "GRBG", "GBRG"]).default("RGGB"), Tr = Ye({
  lighting: He.optional(),
  pattern: en.optional()
}).default({});
function Er(e) {
  switch (e) {
    case "RGGB":
      return 0;
    case "BGGR":
      return 1;
    case "GRBG":
      return 2;
    case "GBRG":
      return 3;
  }
}
function Nr(e) {
  return ee({
    queryKey: ["raf-decoded-raster", e],
    queryFn: async () => {
      if (!e)
        return null;
      const n = e.getPayload();
      if (!n)
        return null;
      const t = n.getLittleEndian(), r = n.getFirstIfdOffset(t);
      if (!r)
        return null;
      const o = n.getImageWidth(r, t), i = n.getImageLength(r, t), s = n.getBitsPerSample(r, t);
      if (!o || !i || !s)
        return null;
      const u = new Uint8Array(
        n.buffer,
        n.byteOffset,
        n.byteLength
      ), c = on(u, o, i);
      if (!c)
        return null;
      const a = sn(c, o, i);
      return a ? { width: o, height: i, bitsPerSample: s, data: a } : null;
    },
    retry: 3,
    retryDelay: ne,
    staleTime: 1 / 0
  });
}
function Zr(e, n) {
  return ee({
    queryKey: ["raf-pipeline", e, n],
    queryFn: () => {
      if (!e || !n)
        return null;
      const t = e.createShaderModule({ code: $r }), r = e.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: t,
          entryPoint: "vs_main"
        },
        fragment: {
          module: t,
          entryPoint: "fs_main",
          targets: [{ format: n }]
        },
        primitive: {
          topology: "triangle-list"
        }
      }), o = r.getBindGroupLayout(0), i = e.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });
      return { bindGroupLayout: o, pipeline: r, uniformBuffer: i };
    },
    retry: 3,
    retryDelay: ne,
    staleTime: 1 / 0
  });
}
function Jr(e) {
  return ee({
    queryKey: ["raf-image", e],
    queryFn: async () => {
      if (!e)
        return null;
      const n = await rn(e);
      return n ? n.getCfa() : null;
    },
    retry: 3,
    retryDelay: ne,
    staleTime: 1 / 0
  });
}
function Gr(e, n, t = {}) {
  const { device: r } = un(), o = cn(), { data: i } = Zr(r, o), { data: s } = Nr(n), u = Tr.parse(t), c = He.parse(u.lighting ?? {}), a = en.parse(u.pattern);
  tn(() => {
    const l = e.current;
    if (!l || !i || !r || !o || !s)
      return;
    const { width: h, height: d, bitsPerSample: p, data: b } = s;
    if (h <= 0 || d <= 0)
      return;
    l.width !== h && (l.width = h), l.height !== d && (l.height = d);
    const g = r.createTexture({
      size: [h, d],
      format: "r16uint",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    });
    r.queue.writeTexture(
      { texture: g },
      b,
      { bytesPerRow: h * 2 },
      { width: h, height: d }
    );
    const T = l.getContext("webgpu");
    if (!T)
      return;
    T.configure({
      device: r,
      format: o,
      alphaMode: "premultiplied"
    });
    const q = (1 << p) - 1, K = new Float32Array([
      c.exposure,
      c.contrast,
      c.saturation,
      c.vibrance,
      c.highlights,
      c.shadows,
      c.whites,
      c.blacks,
      c.tint,
      c.temperature,
      c.hue,
      0,
      q,
      Er(a),
      0,
      0
    ]);
    r.queue.writeBuffer(i.uniformBuffer, 0, K);
    const P = r.createBindGroup({
      layout: i.bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: g.createView()
        },
        {
          binding: 1,
          resource: { buffer: i.uniformBuffer }
        }
      ]
    }), w = r.createCommandEncoder(), k = w.beginRenderPass({
      colorAttachments: [
        {
          view: T.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 }
        }
      ]
    });
    k.setPipeline(i.pipeline), k.setBindGroup(0, P), k.draw(6), k.end(), r.queue.submit([w.finish()]);
  }, [
    e,
    r,
    o,
    i,
    s,
    c.exposure,
    c.contrast,
    c.saturation,
    c.vibrance,
    c.highlights,
    c.shadows,
    c.whites,
    c.blacks,
    c.tint,
    c.temperature,
    c.hue,
    a
  ]);
}
export {
  Jr as useRafImage,
  Gr as useRafRender
};
//# sourceMappingURL=raf.js.map
