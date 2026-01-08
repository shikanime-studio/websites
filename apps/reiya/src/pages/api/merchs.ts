import { createD1Database } from "../../lib/db";
import { getItemsWithMakers } from "../../lib/items";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const db = createD1Database(locals);
  const items = await getItemsWithMakers(db);

  const galleryItems = items.map((item) => ({
    id: item.id,
    title: item.name,
    images: item.imageUrls,
    artist: {
      name: item.maker?.name || "Unknown",
      avatar: item.maker?.avatarImageUrl
        ? {
          src: item.maker.avatarImageUrl,
          width: item.maker.avatarImageWidth || 0,
          height: item.maker.avatarImageHeight || 0,
        }
        : {
          src: `https://placehold.co/100x100/ccc/FFF?text=${encodeURIComponent(item.maker?.name || "?")}`,
          width: 100,
          height: 100,
        },
    },
    rating: 5,
    reviewCount: 12,
    status: "OPEN" as const,
    price: item.priceRange || undefined,
    href: `/items/${item.id}`,
  }));

  return new Response(JSON.stringify(galleryItems), {
    headers: {
      "content-type": "application/json",
    },
  });
};
