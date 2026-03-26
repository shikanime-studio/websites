globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CHD7AjNf.mjs";
import { d as reactExports, m as maybeRenderHead, b as renderTemplate, r as renderComponent } from "./worker-entry_kwuYKouP.mjs";
import { c as createLucideIcon, j as jsxRuntimeExports, I as Image, $ as $$FluidLayout } from "./FluidLayout_D_A5_pNQ.mjs";
import { E as EmptyState, C as Card, g as CardCarousel, h as CardStatus, i as CardBookmark, j as CardInfo, Q as QueryProvider, u as useQuery, T as TabList, a as Tab, b as TabContent, k as Gallery, S as ShowcaseGalleryContent, l as fetchShowcases, d as fetchArtists, e as fetchCharacters, c as fetchEvents } from "./TabList_CAwAjsMz.mjs";
import { b as createD1Database, f as categories } from "./db_CsmScAB6.mjs";
const __iconNode = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode);
function FeaturedCarouselItem({ item }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "carousel-item w-70 min-w-70 sm:w-[320px] sm:min-w-[320px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      CardCarousel,
      {
        title: item.title,
        href: item.href,
        images: item.images.map((img) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Image,
          {
            src: img.src,
            alt: `${item.title} - image`,
            width: img.width,
            height: img.height,
            layout: "constrained",
            className: "h-full w-full object-contain"
          },
          img.src
        )),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardStatus, { status: item.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardBookmark, {})
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardInfo, { ...item })
  ] }) });
}
function Featured({
  title,
  items,
  className = "",
  viewAllLink
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex w-full flex-col gap-6 ${className}`, children: [
    (title ?? viewAllLink) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-1", children: [
      title && /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900", children: title }),
      viewAllLink && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: viewAllLink,
          className: "flex items-center gap-1 text-sm font-bold text-gray-500 transition-colors hover:text-gray-900",
          children: [
            "View all",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
          ]
        }
      )
    ] }),
    items.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "carousel carousel-center scrollbar-hide -mx-4 w-full gap-4 px-4 sm:mx-0 sm:px-0", children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(FeaturedCarouselItem, { item }, item.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        title: "No items yet",
        description: "We couldn't find any items to display in this section."
      }
    )
  ] });
}
function FilterButton({
  label,
  active,
  hasDropdown,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: `btn btn-neutral flex items-center gap-2 rounded-full border-none px-4 py-2 text-sm font-medium transition-all ${active ? "text-primary bg-gray-200 font-bold hover:bg-gray-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} `,
      children: [
        label,
        hasDropdown && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            "aria-hidden": "true",
            className: `h-4 w-4 ${active ? "text-primary" : "text-gray-500"}`,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M19 9l-7 7-7-7"
              }
            )
          }
        )
      ]
    }
  );
}
function FilterBar({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "scrollbar-hide flex gap-3 overflow-x-auto pb-2", children });
}
function ExploreSectionTitle({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "flex items-center gap-2 text-xl font-bold text-gray-900", children });
}
function ExploreSectionExpend({
  href,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "a",
    {
      href,
      className: "flex items-center gap-1 text-sm font-bold text-gray-500 transition-colors hover:text-gray-900",
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3 w-3" })
      ]
    }
  );
}
function ExploreSectionHead({
  className = "",
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex items-center justify-between px-1 ${className}`, children });
}
function ExploreSection({
  className = "",
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: `flex flex-col gap-6 ${className}`, children });
}
function ExploreFeaturedContent() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["showcases"],
    queryFn: fetchShowcases,
    staleTime: 1e3 * 60 * 5
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode: isLoading ? "visible" : "hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "loading loading-spinner loading-lg text-primary" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode: isLoading ? "hidden" : "visible", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Featured, { items }) })
  ] });
}
function ExploreFeatured({
  className,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ExploreSection, { className: className ?? "", children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(ExploreFeaturedContent, {})
  ] }) });
}
function ExploreArtistsContent() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["artists"],
    queryFn: fetchArtists,
    staleTime: 1e3 * 60 * 5
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode: isLoading ? "visible" : "hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "loading loading-spinner loading-lg text-primary" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode: isLoading ? "hidden" : "visible", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Featured, { items }) })
  ] });
}
function ExploreArtists({
  className,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ExploreSection, { className: className ?? "", children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(ExploreArtistsContent, {})
  ] }) });
}
function ExploreCharactersContent() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
    staleTime: 1e3 * 60 * 5
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode: isLoading ? "visible" : "hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "loading loading-spinner loading-lg text-primary" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode: isLoading ? "hidden" : "visible", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Featured, { items }) })
  ] });
}
function ExploreCharacters({
  className,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ExploreSection, { className: className ?? "", children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(ExploreCharactersContent, {})
  ] }) });
}
function ExploreConventionsContent() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(ExploreSection, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(ExploreSectionHead, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(ExploreSectionTitle, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-bold", children: "NEXT" }),
        " ",
        "Upcoming Conventions"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExploreSectionExpend, { href: "/explore?type=events", children: "View all events" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "carousel carousel-center scrollbar-hide w-full gap-3", children: ["USA", "Europe", "Japan", "Asia", "Online", "Popup Shops"].map(
      (cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "carousel-item", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "rounded-full bg-white px-3 py-1.5 text-xs font-bold whitespace-nowrap text-gray-600 hover:bg-gray-50",
          children: cat
        }
      ) }, cat)
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode: isLoading ? "visible" : "hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-64 w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "loading loading-spinner loading-lg text-primary" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode: isLoading ? "hidden" : "visible", children: events.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6", children: events.map((event) => {
      const image = event.images[0];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: event.href,
          className: "group flex cursor-pointer flex-col gap-1",
          children: [
            image ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square overflow-hidden rounded-xl bg-gray-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Image,
                {
                  src: image.src,
                  width: image.width,
                  height: image.height,
                  layout: "constrained",
                  className: "h-full w-full object-cover transition duration-300 group-hover:scale-105",
                  alt: event.title
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-2 rounded-full bg-white/90 p-1 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 rounded-full bg-red-500" }) })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: event.price }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "truncate text-sm font-bold text-gray-900", children: event.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-gray-900", children: event.artist.name })
          ]
        },
        event.id
      );
    }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmptyState,
      {
        title: "No conventions found",
        description: "Check back later for upcoming events."
      }
    ) })
  ] });
}
function ExploreConventions() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExploreConventionsContent, {}) });
}
function ExploreShowcaseContent() {
  const filters = [
    "Random",
    "Latest",
    "AI",
    "Gamemakers",
    "Verified",
    "Base price",
    "Availability"
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TabList, { defaultTab: "Merch Findings", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { value: "Featured Artists & Circles", name: "showcase_tabs", children: "Featured Artists & Circles" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { value: "Merch Findings", name: "showcase_tabs", children: "Merch Findings" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabContent, { value: "Merch Findings", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(FilterBar, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilterButton, { label: "Category", hasDropdown: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilterButton, { label: "Licenses", hasDropdown: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilterButton, { label: "Service options", hasDropdown: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilterButton, { label: "Price", hasDropdown: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilterButton, { label: "On sale" }),
        filters.map((label) => /* @__PURE__ */ jsxRuntimeExports.jsx(FilterButton, { label }, label))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gallery, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ShowcaseGalleryContent,
        {
          queryKey: ["showcases"],
          queryFn: fetchShowcases
        }
      ) })
    ] }) })
  ] });
}
function ExploreShowcase() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExploreShowcaseContent, {}) });
}
const $$Hero = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="space-y-4"> <!-- Header Section --> <div class="mb-8"> <h1 class="text-base-content text-3xl font-black tracking-tight md:text-4xl">
Find your favorite merch at your conventions
</h1> </div> <!-- Banners Grid --> <div class="grid h-48 grid-cols-1 gap-4 md:h-64 md:grid-cols-3"> <div class="bg-neutral text-neutral-content group relative flex cursor-pointer flex-col justify-end overflow-hidden rounded-3xl p-8 shadow-lg"> <div class="absolute inset-0 bg-[url('https://placehold.co/800x600/3c283e/FFF?text=Merch')] bg-cover bg-center opacity-40 transition duration-500 group-hover:scale-105"></div> <div class="relative z-10"> <h2 class="mb-2 text-2xl font-bold">Track Merch</h2> <p class="text-sm opacity-90">Follow characters and artists to get notified about new drops.</p> </div> </div> <div class="group relative flex cursor-pointer flex-col justify-end overflow-hidden rounded-3xl bg-[#5c2e2e] p-8 text-white shadow-lg"> <div class="absolute inset-0 bg-[url('https://placehold.co/800x600/5c2e2e/7f3f3f?text=Conventions')] bg-cover bg-center opacity-60 transition duration-500 group-hover:scale-105"></div> <div class="relative z-10"> <h2 class="mb-2 text-2xl font-bold">Conventions & Popups</h2> <p class="text-sm opacity-90">Discover where to find exclusive merch near you.</p> </div> </div> <div class="bg-primary text-primary-content group relative flex hidden cursor-pointer flex-col justify-end overflow-hidden rounded-3xl p-8 shadow-lg md:flex"> <div class="absolute inset-0 bg-[url('https://placehold.co/800x600/ed2533/FFF?text=Community')] bg-cover bg-center opacity-40 transition duration-500 group-hover:scale-105"></div> <div class="relative z-10"> <h2 class="mb-2 text-2xl font-bold">Community Wishlists</h2> <p class="text-sm opacity-90">Vote for the merch you want to see available in your region.</p> </div> </div> </div> </div>`;
}, "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/components/Hero.astro", void 0);
const $$Explore = createComponent(async ($$result, $$props, $$slots) => {
  const db = createD1Database();
  const categories$1 = await db.select().from(categories);
  return renderTemplate`${renderComponent($$result, "FluidLayout", $$FluidLayout, {}, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col gap-6"> ${renderComponent($$result2, "Hero", $$Hero, {})} <div class="carousel carousel-center scrollbar-hide w-full gap-3"> ${categories$1.map((cat) => renderTemplate`<div class="carousel-item"> <button class="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-gray-700 shadow-sm transition hover:bg-gray-50"> <span class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-600"> ${cat.icon} </span> ${cat.name} </button> </div>`)} <div class="carousel-item"> <button class="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold whitespace-nowrap text-gray-700 transition hover:bg-gray-200">
All categories &rarr;
</button> </div> </div> ${renderComponent($$result2, "ExploreFeatured", ExploreFeatured, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/components/Explore", "client:component-export": "ExploreFeatured" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "ExploreSectionHead", ExploreSectionHead, {}, { "default": async ($$result4) => renderTemplate` ${renderComponent($$result4, "ExploreSectionTitle", ExploreSectionTitle, {}, { "default": async ($$result5) => renderTemplate`Discover Trending Merch` })} ${renderComponent($$result4, "ExploreSectionExpend", ExploreSectionExpend, { "href": "/explore?type=merchs" }, { "default": async ($$result5) => renderTemplate` View all ` })} ` })} ` })} ${renderComponent($$result2, "ExploreArtists", ExploreArtists, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/components/Explore", "client:component-export": "ExploreArtists" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "ExploreSectionHead", ExploreSectionHead, {}, { "default": async ($$result4) => renderTemplate` ${renderComponent($$result4, "ExploreSectionTitle", ExploreSectionTitle, {}, { "default": async ($$result5) => renderTemplate`Featured Artists & Circles` })} ${renderComponent($$result4, "ExploreSectionExpend", ExploreSectionExpend, { "href": "/explore?type=artists" }, { "default": async ($$result5) => renderTemplate` View all ` })} ` })} ` })} ${renderComponent($$result2, "ExploreCharacters", ExploreCharacters, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/components/Explore", "client:component-export": "ExploreCharacters" }, { "default": async ($$result3) => renderTemplate` ${renderComponent($$result3, "ExploreSectionHead", ExploreSectionHead, {}, { "default": async ($$result4) => renderTemplate` ${renderComponent($$result4, "ExploreSectionTitle", ExploreSectionTitle, {}, { "default": async ($$result5) => renderTemplate`Popular Characters` })} ${renderComponent($$result4, "ExploreSectionExpend", ExploreSectionExpend, { "href": "/explore?type=characters" }, { "default": async ($$result5) => renderTemplate` View all ` })} ` })} ` })} ${renderComponent($$result2, "ExploreConventions", ExploreConventions, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/components/Explore", "client:component-export": "ExploreConventions" })} ${renderComponent($$result2, "ExploreShowcase", ExploreShowcase, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/components/Explore", "client:component-export": "ExploreShowcase" })} </div> ` })}`;
}, "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/pages/explore.astro", void 0);
const $$file = "/Users/shikanimedeva/Source/Repos/github.com/shikanime-studio/websites/apps/reiya/src/pages/explore.astro";
const $$url = "/explore";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Explore,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
