globalThis.process ??= {};
globalThis.process.env ??= {};
import { b as createD1Database } from "./db_CsmScAB6.mjs";
import { c as getItemsWithMakers } from "./items_Bg102UND.mjs";
const GET = async () => {
  const db = createD1Database();
  const items = await getItemsWithMakers(db);
  const galleryItems = items.map((item) => ({
    id: item.id,
    title: item.name,
    images: item.imageUrls,
    artist: {
      name: item.maker?.name ?? "Unknown",
      avatar: item.maker?.avatarImageUrl ? {
        src: item.maker.avatarImageUrl,
        width: item.maker.avatarImageWidth ?? 0,
        height: item.maker.avatarImageHeight ?? 0
      } : {
        src: `https://placehold.co/100x100/ccc/FFF?text=${encodeURIComponent(item.maker?.name ?? "?")}`,
        width: 100,
        height: 100
      }
    },
    rating: 5,
    reviewCount: 12,
    status: "OPEN",
    price: item.priceRange ?? void 0,
    href: `/items/${String(item.id)}`
  }));
  return new Response(JSON.stringify(galleryItems), {
    headers: {
      "content-type": "application/json"
    }
  });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
