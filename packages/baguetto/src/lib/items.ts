import {
  type Schema,
  items,
  makers,
  events,
  characters,
  licenses,
} from "../schema";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, desc, gt, like, or } from "drizzle-orm";

export function getItemsByMaker(
  db: DrizzleD1Database<Schema>,
  makerId: number,
) {
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
      },
    })
    .from(items)
    .leftJoin(makers, eq(items.makerId, makers.id))
    .where(eq(items.makerId, makerId))
    .orderBy(desc(items.createdAt));
}

export function getItemsByCharacterName(
  db: DrizzleD1Database<Schema>,
  characterName: string,
) {
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
      },
    })
    .from(items)
    .leftJoin(makers, eq(items.makerId, makers.id))
    .where(
      or(
        like(items.name, `%${characterName}%`),
        like(items.description, `%${characterName}%`),
      ),
    )
    .orderBy(desc(items.createdAt));
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
      },
    })
    .from(items)
    .leftJoin(makers, eq(items.makerId, makers.id))
    .orderBy(desc(items.createdAt));
}

export function getItem(db: DrizzleD1Database<Schema>, id: number) {
  return db
    .select({
      id: items.id,
      name: items.name,
      description: items.description,
      priceRange: items.priceRange,
      imageUrls: items.imageUrls,
      category: items.category,
      maker: {
        id: makers.id,
        name: makers.name,
        avatarImageUrl: makers.avatarImageUrl,
      },
    })
    .from(items)
    .leftJoin(makers, eq(items.makerId, makers.id))
    .where(eq(items.id, id))
    .get();
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
      },
    })
    .from(items)
    .leftJoin(makers, eq(items.makerId, makers.id))
    .orderBy(desc(items.createdAt))
    .limit(limit);
}

export function getUpcomingEvents(db: DrizzleD1Database<Schema>, limit = 3) {
  const now = new Date().toISOString();
  return db
    .select()
    .from(events)
    .where(gt(events.endsAt, now))
    .orderBy(events.startsAt)
    .limit(limit);
}

export function getFeaturedMakers(db: DrizzleD1Database<Schema>, limit = 8) {
  return db.select().from(makers).limit(limit);
}

export function getAllMakers(db: DrizzleD1Database<Schema>) {
  return db.select().from(makers).orderBy(makers.name);
}

export function getMaker(db: DrizzleD1Database<Schema>, id: number) {
  return db.select().from(makers).where(eq(makers.id, id)).get();
}

export function getLicenses(db: DrizzleD1Database<Schema>, limit = 10) {
  return db.select().from(licenses).limit(limit);
}

export function getAllLicenses(db: DrizzleD1Database<Schema>) {
  return db.select().from(licenses).orderBy(licenses.name);
}

export function getAllEvents(db: DrizzleD1Database<Schema>) {
  return db.select().from(events).orderBy(desc(events.startsAt));
}

export function getAllCharacters(db: DrizzleD1Database<Schema>) {
  return db.select().from(characters).orderBy(characters.name);
}

export function getCharacter(db: DrizzleD1Database<Schema>, id: number) {
  return db.select().from(characters).where(eq(characters.id, id)).get();
}
