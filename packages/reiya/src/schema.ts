import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey(),
  googleId: text("google_id"),
  email: text("email").notNull(),
  name: text("name").notNull(),
  pictureUrl: text("picture_url").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: integer("account_id")
    .notNull()
    .references(() => accounts.id),
  expiresAt: text("expires_at")
    .notNull()
    .default(sql`(datetime('now', '+30 days'))`),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
});

export const eventsToPages = sqliteTable(
  'events_to_pages',
  {
    eventId: integer('event_id')
      .notNull()
      .references(() => events.id),
    pageId: integer('page_id')
      .notNull()
      .references(() => pages.id),
  },
  (t) => [
    primaryKey({ columns: [t.eventId, t.pageId] })
  ],
);

export const eventsToPagesRelations = relations(eventsToPages, ({ one }) => ({
  event: one(events, {
    fields: [eventsToPages.eventId],
    references: [events.id],
  }),
  page: one(pages, {
    fields: [eventsToPages.pageId],
    references: [pages.id],
  }),
}));

export const licenses = sqliteTable("licenses", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const licenseRelations = relations(licenses, ({ many }) => ({
  characters: many(characters),
}));

export const characters = sqliteTable("characters", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const pages = sqliteTable("pages", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  avatarImageUrl: text("avatar_image_url").notNull(),
  coverImageUrl: text("cover_image_url").notNull(),
  links: text("links", { mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrls: text("image_urls", { mode: 'json' })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
  listId: integer("list_id").notNull()
});

export const itemsToLicenses = sqliteTable(
  'items_to_licenses',
  {
    itemId: integer('item_id')
      .notNull()
      .references(() => items.id),
    licenseId: integer('group_id')
      .notNull()
      .references(() => licenses.id),
  },
  (t) => [
    primaryKey({ columns: [t.itemId, t.licenseId] })
  ],
);

export const itemsToLicensesRelations = relations(itemsToLicenses, ({ one }) => ({
  item: one(items, {
    fields: [itemsToLicenses.itemId],
    references: [items.id],
  }),
  license: one(licenses, {
    fields: [itemsToLicenses.licenseId],
    references: [licenses.id],
  }),
}));
