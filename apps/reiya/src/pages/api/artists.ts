import type { APIRoute } from 'astro'
import { createD1Database } from '../../lib/db'
import { getAllMakers } from '../../lib/items'

export const GET: APIRoute = async ({ locals }) => {
  const db = createD1Database(locals)
  const makers = await getAllMakers(db)

  const artistItems = makers.map(maker => ({
    id: maker.id,
    title: maker.name,
    images: maker.avatarImageUrl
      ? [
          {
            src: maker.avatarImageUrl,
            width: maker.avatarImageWidth ?? 0,
            height: maker.avatarImageHeight ?? 0,
          },
        ]
      : [
          {
            src: `https://placehold.co/600x400/ffe4e6/be123c?text=${encodeURIComponent(maker.name)}`,
            width: 600,
            height: 400,
          },
        ],
    artist: {
      name: maker.name,
      avatar: maker.avatarImageUrl
        ? {
            src: maker.avatarImageUrl,
            width: maker.avatarImageWidth ?? 0,
            height: maker.avatarImageHeight ?? 0,
          }
        : {
            src: `https://placehold.co/100x100/ccc/FFF?text=${encodeURIComponent(maker.name)}`,
            width: 100,
            height: 100,
          },
      verified: true,
    },
    rating: 5.0,
    reviewCount: Math.floor(Math.random() * 50) + 1,
    status: 'OPEN' as const,
    href: `/artists/${String(maker.id)}`,
  }))

  return new Response(JSON.stringify(artistItems), {
    headers: {
      'content-type': 'application/json',
    },
  })
}
