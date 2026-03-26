globalThis.process ??= {};
globalThis.process.env ??= {};
const GET = ({ redirect }) => redirect("https://shikanime.studio", 301);
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
