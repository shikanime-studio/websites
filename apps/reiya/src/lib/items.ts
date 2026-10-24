import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Schema } from "../schema";
import { desc, eq } from "drizzle-orm";
import { characters, events, items, makers } from "../schema";

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

