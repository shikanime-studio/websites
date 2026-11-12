import type { CardData } from "./contract";
import { Effect } from "effect";
import { createAuth } from "../lib/auth";
import { createD1Database } from "../lib/db";
import {
  getAllCharacters,
  getAllEvents,
  getAllMakers,
  getItemsWithMakers,
  getRecentItems,
  normalizeImages,
} from "../lib/items";
import { categories } from "../schema";
import { group } from "./contract";

type Card = (typeof CardData)["Type"];
type ItemWithMaker = Awaited<ReturnType<typeof getItemsWithMakers>>[number];
type Maker = Awaited<ReturnType<typeof getAllMakers>>[number];
type Event = Awaited<ReturnType<typeof getAllEvents>>[number];
type Character = Awaited<ReturnType<typeof getAllCharacters>>[number];
type RecentItem = Awaited<ReturnType<typeof getRecentItems>>[number];

const fallbackAvatar = (label: string) => ({
  src: `https://placehold.co/100x100/ccc/FFF?text=${encodeURIComponent(label)}`,
  width: 100,
  height: 100,
});

const makerAvatar = (maker: ItemWithMaker["maker"]) =>
  maker?.avatarImageUrl
    ? {
        src: maker.avatarImageUrl,
        width: maker.avatarImageWidth ?? 0,
        height: maker.avatarImageHeight ?? 0,
      }
    : fallbackAvatar(maker?.name ?? "?");

const wideFallback = (name: string, palette: string) => ({
  src: `https://placehold.co/600x400/${palette}?text=${encodeURIComponent(name)}`,
  width: 600,
  height: 400,
});

const merchCard = (item: ItemWithMaker): Card => ({
  id: item.id,
  title: item.name,
  images: normalizeImages(item.imageUrls),
  artist: {
    name: item.maker?.name ?? "Unknown",
    avatar: makerAvatar(item.maker),
  },
  rating: 5,
  reviewCount: 12,
  status: "OPEN",
  price: item.priceRange ?? undefined,
  href: `/items/${String(item.id)}`,
});

const artistCard = (maker: Maker): Card => ({
  id: maker.id,
  title: maker.name,
  images: [
    maker.avatarImageUrl
      ? {
          src: maker.avatarImageUrl,
          width: maker.avatarImageWidth ?? 0,
          height: maker.avatarImageHeight ?? 0,
        }
      : wideFallback(maker.name, "ffe4e6/be123c"),
  ],
  artist: {
    name: maker.name,
    avatar: makerAvatar(maker as ItemWithMaker["maker"]),
    verified: true,
  },
  rating: 5,
  reviewCount: Math.floor(Math.random() * 50) + 1,
  status: "OPEN",
  href: `/artists/${String(maker.id)}`,
});

const eventCard = (event: Event): Card => ({
  id: event.id,
  title: event.name,
  images: [
    event.imageUrl
      ? {
          src: event.imageUrl,
          width: event.imageWidth || 0,
          height: event.imageHeight || 0,
        }
      : wideFallback(event.name, "ffe4e6/be123c"),
  ],
  artist: {
    name: event.location ?? "Online",
    avatar: {
      src: "https://placehold.co/100x100/e2e8f0/64748b?text=EV",
      width: 100,
      height: 100,
    },
    verified: true,
  },
  rating: 5,
  reviewCount: Math.floor(Math.random() * 100) + 10,
  status: "OPEN",
  price: new Date(event.startsAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  }),
  href: `/events/${String(event.id)}`,
});

const characterCard = (char: Character): Card => ({
  id: char.id,
  title: char.name,
  images: [
    char.imageUrl
      ? {
          src: char.imageUrl,
          width: char.imageWidth || 0,
          height: char.imageHeight || 0,
        }
      : wideFallback(char.name, "ffe4e6/be123c"),
  ],
  artist: {
    name: "Original Character",
    avatar: {
      src: "https://placehold.co/100x100/e2e8f0/64748b?text=OC",
      width: 100,
      height: 100,
    },
    verified: true,
  },
  rating: 5,
  reviewCount: Math.floor(Math.random() * 200) + 10,
  status: "OPEN",
  price: undefined,
  href: `/characters/${String(char.id)}`,
});

const showcaseCard = (item: RecentItem): Card => ({
  id: item.id,
  title: item.name,
  images: normalizeImages(item.imageUrls),
  artist: {
    name: item.maker?.name ?? "Unknown Artist",
    avatar: makerAvatar(item.maker),
    verified: true,
    level: Math.floor(Math.random() * 20) + 1,
  },
  rating: Number.parseFloat((Math.random() * 2 + 3).toFixed(1)),
  reviewCount: Math.floor(Math.random() * 100),
  status:
    item.availabilityStatus?.toUpperCase() === "AVAILABLE" ? "OPEN" : "CLOSED",
  price: item.priceRange ?? undefined,
  href: `/items/${String(item.id)}`,
});

export const getCategoriesRows = async () => {
  const db = createD1Database();
  const rows = await db.select().from(categories);
  return rows.slice(0, 8);
};

export const getSessionUserFor = async (headers: Headers) => {
  const db = createD1Database();
  const auth = createAuth(db);
  const session = await auth.api.getSession({ headers });
  if (!session?.user) return null;
  return {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
};

export const getMerchCards = async () =>
  (await getItemsWithMakers(createD1Database())).map(merchCard);
export const getArtistCards = async () =>
  (await getAllMakers(createD1Database())).map(artistCard);
export const getEventCards = async () =>
  (await getAllEvents(createD1Database())).map(eventCard);
export const getCharacterCards = async () =>
  (await getAllCharacters(createD1Database())).map(characterCard);
export const getShowcaseCards = async () =>
  (await getRecentItems(createD1Database(), 20)).map(showcaseCard);

export const handlersLayer = group.toLayer({
  getCategories: () => Effect.promise(getCategoriesRows),
  getSessionUser: (_payload, options) =>
    Effect.promise(() => getSessionUserFor(new Headers(options.headers))),
  getMerchs: () => Effect.promise(getMerchCards),
  getArtists: () => Effect.promise(getArtistCards),
  getEvents: () => Effect.promise(getEventCards),
  getCharacters: () => Effect.promise(getCharacterCards),
  getShowcases: () => Effect.promise(getShowcaseCards),
});
