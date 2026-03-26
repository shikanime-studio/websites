globalThis.process ??= {};
globalThis.process.env ??= {};
import { m as makers, c as characters, e as events, d as desc, i as items, a as eq } from "./db_CsmScAB6.mjs";
function getItemsWithMakers(db) {
  return db.select({
    id: items.id,
    name: items.name,
    priceRange: items.priceRange,
    imageUrls: items.imageUrls,
    category: items.category,
    maker: {
      name: makers.name,
      avatarImageUrl: makers.avatarImageUrl,
      avatarImageWidth: makers.avatarImageWidth,
      avatarImageHeight: makers.avatarImageHeight
    }
  }).from(items).leftJoin(makers, eq(items.makerId, makers.id)).orderBy(desc(items.createdAt));
}
function getRecentItems(db, limit = 10) {
  return db.select({
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
      avatarImageHeight: makers.avatarImageHeight
    }
  }).from(items).leftJoin(makers, eq(items.makerId, makers.id)).orderBy(desc(items.createdAt)).limit(limit);
}
function getAllMakers(db) {
  return db.select().from(makers).orderBy(makers.name);
}
function getAllEvents(db) {
  return db.select().from(events).orderBy(desc(events.startsAt));
}
function getAllCharacters(db) {
  return db.select().from(characters).orderBy(characters.name);
}
export {
  getAllCharacters as a,
  getAllEvents as b,
  getItemsWithMakers as c,
  getRecentItems as d,
  getAllMakers as g
};
