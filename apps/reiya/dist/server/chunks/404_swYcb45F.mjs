globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CHD7AjNf.mjs";
import { r as renderComponent, b as renderTemplate, m as maybeRenderHead } from "./worker-entry_kwuYKouP.mjs";
import { $ as $$Image } from "./_astro_assets_UB9B5S7h.mjs";
import { $ as $$FluidLayout } from "./FluidLayout_D_A5_pNQ.mjs";
const workInProgress = new Proxy({ "src": "/_astro/work-in-progress.5L0XssLS.gif", "width": 540, "height": 472, "format": "gif" }, {
  get(target, name, receiver) {
    if (name === "clone") {
      return structuredClone(target);
    }
    if (name === "fsPath") {
      return "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/assets/work-in-progress.gif";
    }
    return target[name];
  }
});
const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "FluidLayout", $$FluidLayout, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="relative flex min-h-[70vh] items-center justify-center overflow-hidden"> <!-- Decorative Background Elements --> <div class="bg-primary/10 absolute top-20 left-10 h-20 w-20 animate-pulse rounded-full blur-xl"></div> <div class="bg-secondary/20 absolute right-10 bottom-20 h-32 w-32 rounded-full blur-xl"></div> <div class="z-10 container mx-auto px-4"> <div class="mx-auto flex max-w-5xl flex-col items-center justify-center gap-12 lg:flex-row lg:gap-8"> <!-- Text Content --> <div class="flex-1 space-y-6 text-center lg:text-left"> <div class="relative inline-block"> <h1 class="text-primary -rotate-2 transform text-8xl font-black tracking-tighter md:text-9xl">404</h1> <span class="absolute -top-4 -right-8 rotate-12 transform rounded-full bg-black px-3 py-1 text-sm font-bold text-white shadow-md">
OOF!
</span> </div> <h2 class="text-3xl leading-tight font-black tracking-tight text-gray-900 md:text-4xl">
This page is currently<br> <span class="text-primary underline decoration-wavy decoration-2 underline-offset-4">in the oven</span>.
</h2> <p class="mx-auto max-w-md text-lg leading-relaxed font-medium text-gray-600 lg:mx-0">
We couldn't find the page you're looking for. It might have been eaten by our mascot or it's still being
            baked!
</p> <div class="flex flex-col justify-center gap-4 pt-4 sm:flex-row lg:justify-start"> <a href="/" class="btn btn-primary rounded-full px-8 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
Take Me Home
</a> <a href="/merchs" class="btn btn-primary hover:bg-primary rounded-full bg-white px-8 font-bold transition-all duration-300 hover:text-white">
Explore Merch
</a> </div> </div> <!-- Image Content --> <div class="flex flex-1 justify-center lg:justify-start"> <div class="w-64 rotate-3 transform overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:rotate-0 md:w-80"> ${renderComponent($$result2, "Image", $$Image, { "src": workInProgress, "alt": "Work in progress", "class": "h-auto w-full object-cover" })} </div> </div> </div> </div> </div> ` })}`;
}, "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/pages/404.astro", void 0);
const $$file = "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/pages/404.astro";
const $$url = "/404";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
