import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Schema } from "../schema";
import { desc, eq } from "drizzle-orm";
import { characters, events, items, makers } from "../schema";

export interface ImageRef {
  src: string;
  width: number;
  height: number;
}

/** D1 returns `image_urls` as text when the row came from a raw SQL seed; rows
 *  written through drizzle come back parsed. Accept both, never trust either. */
export function normalizeImages(value: unknown): ImageRef[] {
  const parsed = typeof value === "string"
    ? (() => {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        return [];
      }
    })()
    : value;
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((entry): ImageRef[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as { src?: unknown; width?: unknown; height?: unknown };
    if (typeof record.src !== "string") return [];
    return [{
      src: record.src,
      width: typeof record.width === "number" ? record.width : 0,
      height: typeof record.height === "number" ? record.height : 0,
    }];
  });
}

export function getItemsWithMakers(db: DrizzleD1Database<Schema>) {
  return db
    .select({
      id: items.id,
      name: items.name,
      priceRange: items.priceRange,
      imageUrls: items.imageUrls,
      category: items.category,
      maker: {
        name: makers.name,
        avatarImageUrl: makers.avatarImageUrl,
        avatarImageWidth: makers.avatarImageWidth,
        avatarImageHeight: makers.avatarImageHeight,
      },
    })
    .from(items)
    .leftJoin(makers, eq(items.makerId, makers.id))
    .orderBy(desc(items.createdAt));
}

export function getRecentItems(db: DrizzleD1Database<Schema>, limit = 10) {
  return db
    .select({
      id: items.id,
      name: items.name,
      priceRange: items.priceRange,
      imageUrls: items.imageUrls,
      category: items.category,
      availabilityStatus: items.availabilityStatus,
      maker: {
        name: makers.name,
        avatarImageUrl: makers.avatarImageUrl,
        avatarImageWidth: makers.avatarImageWidth,
        avatarImageHeight: makers.avatarImageHeight,
      },
    })
    .from(items)
    .leftJoin(makers, eq(items.makerId, makers.id))
    .orderBy(desc(items.createdAt))
    .limit(limit);
}

export function getAllMakers(db: DrizzleD1Database<Schema>) {
  return db.select().from(makers).orderBy(makers.name);
}

export function getAllEvents(db: DrizzleD1Database<Schema>) {
  return db.select().from(events).orderBy(desc(events.startsAt));
}

export function getAllCharacters(db: DrizzleD1Database<Schema>) {
  return db.select().from(characters).orderBy(characters.name);
}

