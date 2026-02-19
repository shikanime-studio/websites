import { z } from 'zod'

const CardDataSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  status: z.enum(['OPEN', 'CLOSED', 'WAITLIST']),
  href: z.string(),
  images: z.array(
    z.object({
      src: z.string(),
      width: z.number(),
      height: z.number(),
    }),
  ),
  artist: z.object({
    name: z.string(),
    avatar: z.object({
      src: z.string(),
      width: z.number(),
      height: z.number(),
    }),
    verified: z.boolean().optional(),
    level: z.number().optional(),
  }),
  rating: z.number(),
  reviewCount: z.number(),
  price: z.string().optional(),
})

export type CardData = z.infer<typeof CardDataSchema>

const CardDataArraySchema = z.array(CardDataSchema)

export async function fetchMerchs(): Promise<Array<CardData>> {
  const res = await fetch('/api/merchs')
  return CardDataArraySchema.parse(await res.json())
}

export async function fetchArtists(): Promise<Array<CardData>> {
  const res = await fetch('/api/artists')
  return CardDataArraySchema.parse(await res.json())
}

export async function fetchEvents(): Promise<Array<CardData>> {
  const res = await fetch('/api/events')
  return CardDataArraySchema.parse(await res.json())
}

export async function fetchCharacters(): Promise<Array<CardData>> {
  const res = await fetch('/api/characters')
  return CardDataArraySchema.parse(await res.json())
}

export async function fetchShowcases(): Promise<Array<CardData>> {
  const res = await fetch('/api/showcases')
  return CardDataArraySchema.parse(await res.json())
}
