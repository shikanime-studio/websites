globalThis.process ??= {};
globalThis.process.env ??= {};
import { b as createD1Database } from "./db_CsmScAB6.mjs";
import { b as getAllEvents } from "./items_Bg102UND.mjs";
const GET = async () => {
  const db = createD1Database();
  const events = await getAllEvents(db);
  const eventItems = events.map((event) => ({
    id: event.id,
    title: event.name,
    images: event.imageUrl ? [
      {
        src: event.imageUrl,
        width: event.imageWidth || 0,
        height: event.imageHeight || 0
      }
    ] : [
      {
        src: `https://placehold.co/600x400/ffe4e6/be123c?text=${encodeURIComponent(event.name)}`,
        width: 600,
        height: 400
      }
    ],
    artist: {
      name: event.location ?? "Online",
      avatar: {
        src: `https://placehold.co/100x100/e2e8f0/64748b?text=EV`,
        width: 100,
        height: 100
      },
      verified: true
    },
    rating: 5,
    reviewCount: Math.floor(Math.random() * 100) + 10,
    status: "OPEN",
    price: new Date(event.startsAt).toLocaleDateString(void 0, {
      month: "short",
      day: "numeric"
    }),
    href: `/events/${String(event.id)}`
  }));
  return new Response(JSON.stringify(eventItems), {
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
