import { createD1Database } from "../../lib/db";
import { getRecentItems } from "../../lib/items";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const db = createD1Database(locals);
  const items = await getRecentItems(db, 20);

  const showcases = items.map((item) => ({
    id: item.id,
    title: item.name,
    images: item.imageUrls,
    artist: {
      name: item.maker?.name ?? "Unknown Artist",
      avatar: item.maker?.avatarImageUrl
        ? {
            src: item.maker.avatarImageUrl,
            width: item.maker.avatarImageWidth ?? 0,
            height: item.maker.avatarImageHeight ?? 0,
          }
        : {
            src: "https://placehold.co/100x100/ccc/FFF?text=?",
            width: 100,
            height: 100,
          },
      verified: true,
      level: Math.floor(Math.random() * 20) + 1,
    },
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 100),
    status: (item.availabilityStatus?.toUpperCase() === "AVAILABLE"
      ? "OPEN"
      : "CLOSED") as "OPEN" | "CLOSED" | "WAITLIST",
    price: item.priceRange ?? undefined,
  }));

  return new Response(JSON.stringify(showcases), {
    headers: {
      "content-type": "application/json",
    },
  });
};
