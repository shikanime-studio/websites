globalThis.process ??= {};
globalThis.process.env ??= {};
import { b as createD1Database } from "./db_CsmScAB6.mjs";
import { d as getRecentItems } from "./items_Bg102UND.mjs";
const GET = async () => {
  const db = createD1Database();
  const items = await getRecentItems(db, 20);
  const showcases = items.map((item) => ({
    id: item.id,
    title: item.name,
    images: item.imageUrls,
    artist: {
      name: item.maker?.name ?? "Unknown Artist",
      avatar: item.maker?.avatarImageUrl ? {
        src: item.maker.avatarImageUrl,
        width: item.maker.avatarImageWidth ?? 0,
        height: item.maker.avatarImageHeight ?? 0
      } : {
        src: "https://placehold.co/100x100/ccc/FFF?text=?",
        width: 100,
        height: 100
      },
      verified: true,
      level: Math.floor(Math.random() * 20) + 1
    },
    rating: Number.parseFloat((Math.random() * 2 + 3).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 100),
    status: item.availabilityStatus?.toUpperCase() === "AVAILABLE" ? "OPEN" : "CLOSED",
    price: item.priceRange ?? void 0
  }));
  return new Response(JSON.stringify(showcases), {
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
