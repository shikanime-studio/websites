globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CHD7AjNf.mjs";
import { r as renderComponent, b as renderTemplate } from "./worker-entry_kwuYKouP.mjs";
import { j as jsxRuntimeExports, $ as $$FluidLayout } from "./FluidLayout_D_A5_pNQ.mjs";
import { Q as QueryProvider, T as TabList, a as Tab, b as TabContent, G as GalleryContent, f as fetchMerchs, c as fetchEvents, d as fetchArtists, e as fetchCharacters } from "./TabList_CAwAjsMz.mjs";
function Following() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabList, { defaultTab: "merchs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { name: "following_tabs", value: "merchs", children: "Merchs" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabContent, { value: "merchs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GalleryContent, { queryKey: ["merchs"], queryFn: fetchMerchs }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { name: "following_tabs", value: "events", children: "Events" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabContent, { value: "events", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GalleryContent, { queryKey: ["events"], queryFn: fetchEvents }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { name: "following_tabs", value: "artists", children: "Artists" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabContent, { value: "artists", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GalleryContent, { queryKey: ["artists"], queryFn: fetchArtists }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { name: "following_tabs", value: "characters", children: "Characters" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabContent, { value: "characters", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GalleryContent, { queryKey: ["characters"], queryFn: fetchCharacters }) })
  ] }) });
}
const $$Following = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "FluidLayout", $$FluidLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "FollowingComponent", Following, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/components/Following", "client:component-export": "Following" })} ` })}`;
}, "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/pages/following.astro", void 0);
const $$file = "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/pages/following.astro";
const $$url = "/following";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Following,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
