import type { APIRoute } from 'astro'
import { createD1Database } from '../../lib/db'
import { getAllEvents } from '../../lib/items'

export const GET: APIRoute = async ({ locals }) => {
  const db = createD1Database(locals)
  const events = await getAllEvents(db)

  const eventItems = events.map(event => ({
    id: event.id,
    title: event.name,
    images: event.imageUrl
      ? [
          {
            src: event.imageUrl,
            width: event.imageWidth || 0,
            height: event.imageHeight || 0,
          },
        ]
      : [
          {
            src: `https://placehold.co/600x400/ffe4e6/be123c?text=${encodeURIComponent(event.name)}`,
            width: 600,
            height: 400,
          },
        ],
    artist: {
      name: event.location ?? 'Online',
      avatar: {
        src: `https://placehold.co/100x100/e2e8f0/64748b?text=EV`,
        width: 100,
        height: 100,
      },
      verified: true,
    },
    rating: 5.0,
    reviewCount: Math.floor(Math.random() * 100) + 10,
    status: 'OPEN' as const,
    price: new Date(event.startsAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    href: `/events/${String(event.id)}`,
  }))

  return new Response(JSON.stringify(eventItems), {
    headers: {
      'content-type': 'application/json',
    },
  })
}
