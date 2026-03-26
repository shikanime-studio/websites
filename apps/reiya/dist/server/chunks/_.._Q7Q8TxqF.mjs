globalThis.process ??= {};
globalThis.process.env ??= {};
import { f as createAuth } from "./auth_BlB_y6R5.mjs";
import { b as createD1Database } from "./db_CsmScAB6.mjs";
const ALL = async (context) => {
  const db = createD1Database();
  const auth = createAuth(db);
  return auth.handler(context.request);
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ALL
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
