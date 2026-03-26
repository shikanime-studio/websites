globalThis.process ??= {};
globalThis.process.env ??= {};
import { b as createD1Database } from "./db_CsmScAB6.mjs";
import { a as getAllCharacters } from "./items_Bg102UND.mjs";
const GET = async () => {
  const db = createD1Database();
  const characters = await getAllCharacters(db);
  const characterItems = characters.map((char) => ({
    id: char.id,
    title: char.name,
    images: char.imageUrl ? [
      {
        src: char.imageUrl,
        width: char.imageWidth || 0,
        height: char.imageHeight || 0
      }
    ] : [
      {
        src: `https://placehold.co/600x400/ffe4e6/be123c?text=${encodeURIComponent(char.name)}`,
        width: 600,
        height: 400
      }
    ],
    artist: {
      name: "Original Character",
      avatar: {
        src: `https://placehold.co/100x100/e2e8f0/64748b?text=OC`,
        width: 100,
        height: 100
      },
      verified: true
    },
    rating: 5,
    reviewCount: Math.floor(Math.random() * 200) + 10,
    status: "OPEN",
    price: void 0,
    href: `/characters/${String(char.id)}`
  }));
  return new Response(JSON.stringify(characterItems), {
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
