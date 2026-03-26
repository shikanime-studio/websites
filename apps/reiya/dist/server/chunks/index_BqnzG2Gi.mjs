globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CHD7AjNf.mjs";
import { r as renderComponent, b as renderTemplate, m as maybeRenderHead, c as addAttribute } from "./worker-entry_kwuYKouP.mjs";
import { $ as $$FluidLayout, I as Image } from "./FluidLayout_D_A5_pNQ.mjs";
import { f as createAuth } from "./auth_BlB_y6R5.mjs";
import { b as createD1Database } from "./db_CsmScAB6.mjs";
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const db = createD1Database();
  const auth = createAuth(db);
  const session = await auth.api.getSession({
    headers: Astro2.request.headers
  });
  const user = session?.user;
  return renderTemplate`${renderComponent($$result, "FluidLayout", $$FluidLayout, {}, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col gap-4"> <h1 class="text-3xl font-bold">User Settings</h1> ${user ? renderTemplate`<div class="card bg-base-100 max-w-2xl shadow-xl"> <div class="card-body"> <div class="flex items-center gap-4"> <div class="avatar"> <div class="w-24 rounded-full"> ${renderComponent($$result2, "Image", Image, { "src": user.image || `https://ui-avatars.com/api/?name=${user.name}`, "alt": user.name, "width": 96, "height": 96, "layout": "constrained", "className": "h-full w-full object-cover" })} </div> </div> <div> <h2 class="card-title text-2xl">${user.name}</h2> <p class="text-neutral-content">${user.email}</p> </div> </div> <div class="divider"></div> <div class="form-control w-full"> <label class="label" for="user-name"> <span class="label-text">Name</span> </label> <input id="user-name" type="text"${addAttribute(user.name, "value")} class="input input-bordered w-full" disabled> </div> <div class="form-control w-full"> <label class="label" for="user-email"> <span class="label-text">Email</span> </label> <input id="user-email" type="text"${addAttribute(user.email, "value")} class="input input-bordered w-full" disabled> </div> </div> </div>` : renderTemplate`<div class="alert alert-warning"> <span>You need to be logged in to view this page.</span> </div>`} </div> ` })}`;
}, "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/pages/user/index.astro", void 0);
const $$file = "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/pages/user/index.astro";
const $$url = "/user";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
